// @ts-ignore
import { adminAuth, adminDb } from '../server/firebaseAdmin.js';
import { FirebaseDatabaseService } from './services/firebase/FirebaseDatabaseService';
import { calculateExplainableRisk } from './utils/riskCalculator';
import { Student } from './types';

async function runMentorCommandCenterTests() {
  console.log('====================================================');
  console.log(' MENTOR COMMAND CENTER & SECURITY TEST SUITE');
  console.log(' Target Project ID: edumentorx-ab2e1');
  console.log('====================================================');

  const fbDb = new FirebaseDatabaseService();

  const mentorA_email = `cc_mentor_a_${Date.now()}@test.com`;
  const mentorB_email = `cc_mentor_b_${Date.now()}@test.com`;
  const mentorEmpty_email = `cc_mentor_empty_${Date.now()}@test.com`;

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
  await cleanupUser(mentorEmpty_email);

  // 1. Create Mentor A, Mentor B, and Empty Mentor
  const mA = await fbDb.createMentor(
    {
      userId: `u_cc_a_${Date.now()}`,
      staffId: `STAFF-CC-A-${Date.now()}`,
      name: 'Command Mentor A',
      email: mentorA_email,
      phone: '9000000101',
      department: 'Computer Science & Engineering',
    },
    'admin_test'
  );

  const mB = await fbDb.createMentor(
    {
      userId: `u_cc_b_${Date.now()}`,
      staffId: `STAFF-CC-B-${Date.now()}`,
      name: 'Command Mentor B',
      email: mentorB_email,
      phone: '9000000102',
      department: 'Information Science & Engineering',
    },
    'admin_test'
  );

  const mEmpty = await fbDb.createMentor(
    {
      userId: `u_cc_empty_${Date.now()}`,
      staffId: `STAFF-CC-EMPTY-${Date.now()}`,
      name: 'Command Mentor Empty',
      email: mentorEmpty_email,
      phone: '9000000103',
      department: 'Mechanical Engineering',
    },
    'admin_test'
  );

  console.log(`Created Mentor A (${mA.id}), Mentor B (${mB.id}), and Empty Mentor (${mEmpty.id})`);

  // 2. Setup Student A (assigned to Mentor A) and Student B (assigned to Mentor B)
  const studentA = {
    usn: `CC-STU-A-${Date.now()}`,
    name: 'Command Mentee A',
    email: `cc_mentee_a_${Date.now()}@test.com`,
    phone: '9000000104',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'A',
    cgpa: 5.8, // High risk
    attendance: 65, // High risk
    previousYearBacklogs: 2,
    studyHours: 4,
  };

  const studentB = {
    usn: `CC-STU-B-${Date.now()}`,
    name: 'Command Mentee B',
    email: `cc_mentee_b_${Date.now()}@test.com`,
    phone: '9000000105',
    department: 'Information Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'B',
    cgpa: 8.9, // Good standing
    attendance: 94,
    previousYearBacklogs: 0,
    studyHours: 15,
  };

  await fbDb.importStudentsCSV([studentA], 'admin_test');
  await fbDb.importStudentsCSV([studentB], 'admin_test');

  const allStRes = await fbDb.getStudents(1, 100);
  const stADoc = allStRes.students.find((s) => s.email === studentA.email);
  const stBDoc = allStRes.students.find((s) => s.email === studentB.email);

  if (!stADoc || !stBDoc) throw new Error('Failed to load test students');

  await fbDb.bulkAllocateStudents([stADoc.id], mA.id, 'admin_test');
  await fbDb.bulkAllocateStudents([stBDoc.id], mB.id, 'admin_test');

  // 3. Create items for Mentor A
  const intervA = await fbDb.createIntervention(
    {
      studentId: stADoc.id,
      studentName: stADoc.name,
      studentUsn: stADoc.usn,
      mentorId: mA.id,
      mentorName: mA.name,
      category: 'Academic',
      description: 'Critical CGPA and attendance drop.',
      priority: 'HIGH_PRIORITY',
      triggerReasons: ['CGPA < 6.5', 'Attendance < 75%'],
      status: 'IDENTIFIED',
      actionsTaken: ['Initiated intervention'],
      followUpTaskIds: [],
      baselineCgpa: stADoc.cgpa,
      baselineAttendance: stADoc.attendance,
    },
    mA.id
  );

  const todayStr = new Date().toISOString().substring(0, 10);
  const taskA = await fbDb.createFollowUpTask(
    {
      studentId: stADoc.id,
      studentName: stADoc.name,
      mentorId: mA.id,
      mentorName: mA.name,
      title: 'Review math assignment',
      description: 'Check math homework submission',
      dueDate: '2026-08-01', // Overdue
      priority: 'HIGH',
      interventionId: intervA.id,
    },
    mA.id
  );

  const meetingA = await fbDb.createMeeting(
    {
      studentId: stADoc.id,
      studentName: stADoc.name,
      mentorId: mA.id,
      mentorName: mA.name,
      title: 'Command Center Mentorship Session',
      date: todayStr,
      time: '10:00 AM',
      agenda: 'Intervention Discussion',
    },
    mA.id
  );

  await fbDb.createNotification({
    recipientUserId: mA.userId,
    recipientRole: 'mentor',
    title: 'Urgent Mentee Action',
    message: `Follow-up required for ${stADoc.name}`,
    type: 'intervention',
    category: 'INTERVENTION',
    linkSection: 'intervention-center',
  });

  // --- TEST 1: Mentor A Command Center Data Aggregation ---
  console.log('\n--- TEST 1: MENTOR A COMMAND CENTER AGGREGATION ---');
  const [stA, intervA_list, taskA_list, meetA_list, notifA_list] = await Promise.all([
    fbDb.getStudentsByMentorId(mA.id),
    fbDb.getInterventions({ mentorId: mA.id }),
    fbDb.getFollowUpTasks({ mentorId: mA.id }),
    fbDb.getMeetings({ mentorId: mA.id }),
    fbDb.getNotifications(mA.userId, 'mentor'),
  ]);

  console.log(`Mentor A Allocated Students: ${stA.length}`);
  console.log(`Mentor A Interventions Count: ${intervA_list.length}`);
  console.log(`Mentor A Tasks Count: ${taskA_list.length}`);
  console.log(`Mentor A Meetings Count: ${meetA_list.length}`);
  console.log(`Mentor A Notifications Count: ${notifA_list.length}`);

  if (stA.length !== 1 || intervA_list.length !== 1 || taskA_list.length !== 1 || meetA_list.length !== 1) {
    throw new Error('Mentor A command center dataset mismatch');
  }

  // Risk evaluation verification
  const riskEvalA = calculateExplainableRisk(stA[0]);
  console.log(`Student A Evaluated Risk Level: ${riskEvalA.status}`);
  if (riskEvalA.status !== 'HIGH_PRIORITY') {
    throw new Error('Student A expected HIGH_PRIORITY risk evaluation');
  }
  console.log('PASSED: Mentor A Command Center dataset aggregated correctly.');

  // --- TEST 2: Mentor Isolation (Mentor B cannot see Mentor A's data) ---
  console.log('\n--- TEST 2: MENTOR ISOLATION ---');
  const [stB, intervB_list, taskB_list, meetB_list, notifB_list] = await Promise.all([
    fbDb.getStudentsByMentorId(mB.id),
    fbDb.getInterventions({ mentorId: mB.id }),
    fbDb.getFollowUpTasks({ mentorId: mB.id }),
    fbDb.getMeetings({ mentorId: mB.id }),
    fbDb.getNotifications(mB.userId, 'mentor'),
  ]);

  const hasStudentAInB = stB.some((s) => s.id === stADoc.id);
  const hasIntervAInB = intervB_list.some((i) => i.id === intervA.id);
  const hasTaskAInB = taskB_list.some((t) => t.id === taskA.id);
  const hasMeetingAInB = meetB_list.some((m) => m.id === meetingA.id);
  const hasNotifAInB = notifB_list.some((n) => n.recipientUserId === mA.userId);

  if (hasStudentAInB || hasIntervAInB || hasTaskAInB || hasMeetingAInB || hasNotifAInB) {
    throw new Error('Mentor isolation failed! Mentor B accessed Mentor A data');
  }
  console.log('PASSED: Mentor B CANNOT see Mentor A students, interventions, tasks, meetings, or notifications.');

  // --- TEST 3: Empty-State Behavior ---
  console.log('\n--- TEST 3: EMPTY-STATE BEHAVIOR ---');
  const [stEmpty, intervEmpty, taskEmpty, meetEmpty] = await Promise.all([
    fbDb.getStudentsByMentorId(mEmpty.id),
    fbDb.getInterventions({ mentorId: mEmpty.id }),
    fbDb.getFollowUpTasks({ mentorId: mEmpty.id }),
    fbDb.getMeetings({ mentorId: mEmpty.id }),
  ]);

  console.log(`Empty Mentor Mentees: ${stEmpty.length}, Interventions: ${intervEmpty.length}, Tasks: ${taskEmpty.length}, Meetings: ${meetEmpty.length}`);
  if (stEmpty.length !== 0 || intervEmpty.length !== 0 || taskEmpty.length !== 0 || meetEmpty.length !== 0) {
    throw new Error('Empty state test failed');
  }
  console.log('PASSED: Empty-state datasets return clean empty arrays.');

  // Cleanup
  try {
    await cleanupUser(mentorA_email);
    await cleanupUser(mentorB_email);
    await cleanupUser(mentorEmpty_email);
    await adminDb.collection('students').doc(stADoc.id).delete().catch(() => null);
    await adminDb.collection('students').doc(stBDoc.id).delete().catch(() => null);
  } catch {}

  console.log('\n====================================================');
  console.log(' ALL COMMAND CENTER & SECURITY TESTS PASSED SUCCESSFULLY');
  console.log('====================================================');
  process.exit(0);
}

runMentorCommandCenterTests();
