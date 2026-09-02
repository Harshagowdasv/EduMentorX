// @ts-ignore
import { adminAuth, adminDb } from '../server/firebaseAdmin.js';
import { FirebaseDatabaseService } from './services/firebase/FirebaseDatabaseService';
import { InterventionCategory, RiskLevel, InterventionStatus } from './types';

async function runInterventionWorkflowTests() {
  console.log('====================================================');
  console.log(' MENTOR INTERVENTION & FOLLOW-UP TEST SUITE');
  console.log(' Target Project ID: edumentorx-ab2e1');
  console.log('====================================================');

  const fbDb = new FirebaseDatabaseService();

  const mentorA_email = `interv_mentor_a_${Date.now()}@test.com`;
  const mentorB_email = `interv_mentor_b_${Date.now()}@test.com`;

  async function cleanupUser(email: string) {
    try {
      const u = await adminAuth.getUserByEmail(email);
      if (u) {
        await adminAuth.deleteUser(u.uid);
        await adminDb.collection('users').doc(u.uid).delete();
        await adminDb.collection('mentors').doc(u.uid).delete();
      }
    } catch {}
  }

  await cleanupUser(mentorA_email);
  await cleanupUser(mentorB_email);

  // 1. Setup Mentor A and Mentor B
  const mA = await fbDb.createMentor(
    {
      userId: `u_${Date.now()}_a`,
      staffId: `STAFF-${Date.now()}-A`,
      name: 'Intervention Mentor A',
      email: mentorA_email,
      phone: '9000000091',
      department: 'Computer Science & Engineering',
    },
    'admin_test'
  );

  const mB = await fbDb.createMentor(
    {
      userId: `u_${Date.now()}_b`,
      staffId: `STAFF-${Date.now()}-B`,
      name: 'Intervention Mentor B',
      email: mentorB_email,
      phone: '9000000092',
      department: 'Information Science & Engineering',
    },
    'admin_test'
  );

  console.log(`\nCreated Mentor A (${mA.id}) and Mentor B (${mB.id})`);

  // 2. Setup Student A (assigned to Mentor A) and Student B (assigned to Mentor B)
  const studentA = {
    usn: `INT-STU-A-${Date.now()}`,
    name: 'Intervention Mentee A',
    email: `int_mentee_a_${Date.now()}@test.com`,
    phone: '9000000093',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'A',
    cgpa: 6.1,
    attendance: 69,
  };

  const studentB = {
    usn: `INT-STU-B-${Date.now()}`,
    name: 'Intervention Mentee B',
    email: `int_mentee_b_${Date.now()}@test.com`,
    phone: '9000000094',
    department: 'Information Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'B',
    cgpa: 8.5,
    attendance: 91,
  };

  await fbDb.importStudentsCSV([studentA], 'admin_test');
  await fbDb.importStudentsCSV([studentB], 'admin_test');

  const allStRes = await fbDb.getStudents(1, 100);
  const stADoc = allStRes.students.find((s) => s.email === studentA.email);
  const stBDoc = allStRes.students.find((s) => s.email === studentB.email);

  if (!stADoc || !stBDoc) throw new Error('Failed to load created test students');

  await fbDb.bulkAllocateStudents([stADoc.id], mA.id, 'admin_test');
  await fbDb.bulkAllocateStudents([stBDoc.id], mB.id, 'admin_test');

  console.log(`Allocated Student A (${stADoc.id}) to Mentor A, Student B (${stBDoc.id}) to Mentor B`);

  // --- TEST 1: Mentor Creates Intervention for Assigned Student ---
  console.log('\n--- TEST 1: INITIATE INTERVENTION ---');
  const intervA = await fbDb.createIntervention(
    {
      studentId: stADoc.id,
      studentName: stADoc.name,
      studentUsn: stADoc.usn,
      mentorId: mA.id,
      mentorName: mA.name,
      category: 'Attendance',
      description: 'Lecture attendance fell below 70% minimum threshold.',
      priority: 'HIGH_PRIORITY',
      triggerReasons: ['Attendance deficit < 75%', 'CGPA < 6.5'],
      followUpDate: '2026-09-10',
      status: 'IDENTIFIED',
      actionsTaken: ['Initiated attendance intervention workflow'],
      followUpTaskIds: [],
      baselineCgpa: stADoc.cgpa,
      baselineAttendance: stADoc.attendance,
    },
    mA.id
  );

  console.log(`Created Intervention ID: ${intervA.id} for Student A`);
  if (intervA.category !== 'Attendance' || intervA.status !== 'IDENTIFIED') {
    throw new Error('Intervention creation failed matching expected fields');
  }

  // --- TEST 2: Mentor Student Isolation ---
  console.log('\n--- TEST 2: MENTOR STUDENT ISOLATION ---');
  const mentorAInterventions = await fbDb.getInterventions({ mentorId: mA.id });
  const mentorBInterventions = await fbDb.getInterventions({ mentorId: mB.id });

  console.log(`Mentor A Interventions Count: ${mentorAInterventions.length}`);
  console.log(`Mentor B Interventions Count: ${mentorBInterventions.length}`);

  const hasIntervInA = mentorAInterventions.some((i) => i.id === intervA.id);
  const hasIntervInB = mentorBInterventions.some((i) => i.id === intervA.id);

  if (!hasIntervInA || hasIntervInB) {
    throw new Error(`Mentor isolation failed! Has Interv in A: ${hasIntervInA}, Has Interv in B: ${hasIntervInB}`);
  }
  console.log('PASSED: Mentor A sees Student A intervention. Mentor B CANNOT see Student A intervention.');

  // --- TEST 3: Intervention Status Lifecycle ---
  console.log('\n--- TEST 3: INTERVENTION STATUS LIFECYCLE ---');
  const statusSteps: InterventionStatus[] = [
    'CONTACT_PENDING',
    'MEETING_SCHEDULED',
    'IN_PROGRESS',
    'MONITORING',
    'RESOLVED',
    'CLOSED'
  ];

  for (const nextStatus of statusSteps) {
    const updated = await fbDb.updateInterventionStatus(
      intervA.id,
      nextStatus,
      [`Advanced status to ${nextStatus}`],
      7.2,
      82,
      mA.id
    );
    if (updated.status !== nextStatus) {
      throw new Error(`Expected status ${nextStatus} but got ${updated.status}`);
    }
  }
  console.log('PASSED: Status advanced through IDENTIFIED → CONTACT_PENDING → MEETING_SCHEDULED → IN_PROGRESS → MONITORING → RESOLVED → CLOSED');

  // --- TEST 4: Follow-up Task Creation & Overdue Detection ---
  console.log('\n--- TEST 4: FOLLOW-UP TASKS & OVERDUE DETECTION ---');
  const overdueTask = await fbDb.createFollowUpTask(
    {
      studentId: stADoc.id,
      studentName: stADoc.name,
      mentorId: mA.id,
      mentorName: mA.name,
      title: 'Submit attendance improvement plan',
      description: 'Mentee to submit weekly time table',
      dueDate: '2026-08-01', // Past date -> overdue
      priority: 'HIGH',
      interventionId: intervA.id,
    },
    mA.id
  );

  console.log(`Created Task ID: ${overdueTask.id}, Due Date: ${overdueTask.dueDate}`);
  const isOverdue = overdueTask.status !== 'COMPLETED' && new Date(overdueTask.dueDate) < new Date();
  if (!isOverdue) {
    throw new Error('Overdue task detection failed');
  }
  console.log('PASSED: Overdue follow-up task detected correctly.');

  // Task Completion
  const completedTask = await fbDb.updateTaskStatus(overdueTask.id, 'COMPLETED');
  if (completedTask.status !== 'COMPLETED') {
    throw new Error('Task completion update failed');
  }
  console.log('PASSED: Follow-up task completion updated to COMPLETED.');

  // --- TEST 5: Reassignment History Preservation ---
  console.log('\n--- TEST 5: REASSIGNMENT HISTORY PRESERVATION ---');
  // Reassign Student A from Mentor A to Mentor B
  await fbDb.bulkAllocateStudents([stADoc.id], mB.id, 'admin_test', { reassignAll: true });
  console.log(`Reassigned Student A (${stADoc.id}) from Mentor A to Mentor B`);

  // Mentor B should now be able to view Student A's historical intervention created by Mentor A!
  const mentorBNewInterventions = await fbDb.getInterventions({ mentorId: mB.id });
  const hasHistoricalIntervInB = mentorBNewInterventions.some((i) => i.id === intervA.id);

  console.log(`Mentor B Interventions Count after Reassignment: ${mentorBNewInterventions.length}`);
  if (!hasHistoricalIntervInB) {
    throw new Error('Historical intervention record was lost after mentor reassignment!');
  }
  console.log('PASSED: Historical intervention created by Mentor A survived reassignment and is visible to new Mentor B.');

  // --- TEST 6: Admin Institutional Visibility ---
  console.log('\n--- TEST 6: ADMIN INSTITUTIONAL VISIBILITY ---');
  const allInterventionsAdmin = await fbDb.getInterventions();
  console.log(`Admin Total Institutional Interventions Count: ${allInterventionsAdmin.length}`);
  const adminHasInterv = allInterventionsAdmin.some((i) => i.id === intervA.id);
  if (!adminHasInterv) {
    throw new Error('Admin institutional visibility test failed!');
  }
  console.log('PASSED: Admin retains full institutional visibility across all student interventions.');

  // Cleanup
  try {
    await cleanupUser(mentorA_email);
    await cleanupUser(mentorB_email);
    await adminDb.collection('students').doc(stADoc.id).delete().catch(() => null);
    await adminDb.collection('students').doc(stBDoc.id).delete().catch(() => null);
  } catch {}

  console.log('\n====================================================');
  console.log(' ALL INTERVENTION & FOLLOW-UP TESTS PASSED SUCCESSFULLY');
  console.log('====================================================');
  process.exit(0);
}

runInterventionWorkflowTests();
