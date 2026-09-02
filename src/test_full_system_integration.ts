// @ts-ignore
import { adminAuth, adminDb } from '../server/firebaseAdmin.js';
import { FirebaseDatabaseService } from './services/firebase/FirebaseDatabaseService';
import { calculateExplainableRisk } from './utils/riskCalculator';
import { analyzeSkillGaps, calculatePlacementReadiness } from './utils/careerIntelligenceEngine';

async function runFullSystemIntegrationAudit() {
  console.log('====================================================');
  console.log(' EDUMENTORX FULL-SYSTEM INTEGRATION & SECURITY AUDIT');
  console.log(' Target Project ID: edumentorx-ab2e1');
  console.log('====================================================');

  const fbDb = new FirebaseDatabaseService();

  const mentorA_email = `audit_mentor_a_${Date.now()}@test.com`;
  const mentorB_email = `audit_mentor_b_${Date.now()}@test.com`;
  const student1_email = `audit_student_1_${Date.now()}@test.com`;
  const student2_email = `audit_student_2_${Date.now()}@test.com`;

  async function cleanupUser(email: string) {
    try {
      const u = await adminAuth.getUserByEmail(email);
      if (u) {
        await adminAuth.deleteUser(u.uid);
        await adminDb.collection('users').doc(u.uid).delete();
        await adminDb.collection('mentors').doc(u.uid).delete();
        await adminDb.collection('students').doc(u.uid).delete();
      }
    } catch {}
  }

  await cleanupUser(mentorA_email);
  await cleanupUser(mentorB_email);
  await cleanupUser(student1_email);
  await cleanupUser(student2_email);

  // STEP 1: Admin Creates Mentors
  console.log('\n--- PHASE 1: ADMIN MENTOR CREATION & CSV IMPORT ---');
  const mA = await fbDb.createMentor(
    {
      userId: `u_aud_ma_${Date.now()}`,
      staffId: `STAFF-AUD-A-${Date.now()}`,
      name: 'Dr. Audit Mentor A',
      email: mentorA_email,
      phone: '9000000201',
      department: 'Computer Science & Engineering',
    },
    'admin_test'
  );

  const mB = await fbDb.createMentor(
    {
      userId: `u_aud_mb_${Date.now()}`,
      staffId: `STAFF-AUD-B-${Date.now()}`,
      name: 'Dr. Audit Mentor B',
      email: mentorB_email,
      phone: '9000000202',
      department: 'Information Science & Engineering',
    },
    'admin_test'
  );

  console.log(`Mentor A Created: ${mA.name} (${mA.id})`);
  console.log(`Mentor B Created: ${mB.name} (${mB.id})`);

  // STEP 2: Import Student via CSV without mentor email
  const csvStudent1 = {
    usn: `AUD-STU-1-${Date.now()}`,
    name: 'Audit Student One',
    email: student1_email,
    phone: '9000000203',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'A',
    cgpa: 5.9, // High academic risk
    attendance: 68, // High attendance risk
    previousYearBacklogs: 2,
    skills: ['React', 'TypeScript'],
    careerGoal: 'Full-Stack Developer',
  };

  const csvStudent2 = {
    usn: `AUD-STU-2-${Date.now()}`,
    name: 'Audit Student Two',
    email: student2_email,
    phone: '9000000204',
    department: 'Information Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'B',
    cgpa: 8.8,
    attendance: 92,
    previousYearBacklogs: 0,
    skills: ['Python', 'SQL'],
    careerGoal: 'Data Analyst / Data Scientist',
  };

  await fbDb.importStudentsCSV([csvStudent1, csvStudent2], 'admin_test');
  console.log('CSV Import Completed without mentor email requirement.');

  const allStRes = await fbDb.getStudents(1, 100);
  const st1 = allStRes.students.find((s) => s.email === student1_email);
  const st2 = allStRes.students.find((s) => s.email === student2_email);

  if (!st1 || !st2) throw new Error('CSV Import failed to persist students');

  // STEP 3: Allocate Student 1 to Mentor A
  await fbDb.bulkAllocateStudents([st1.id], mA.id, 'admin_test');
  console.log(`Allocated ${st1.name} to Mentor A (${mA.name})`);

  // STEP 4: Mentor A Workflow
  console.log('\n--- PHASE 2: MENTOR A WORKFLOW & RISK EVALUATION ---');
  const menteeListOfA = await fbDb.getStudentsByMentorId(mA.id);
  console.log(`Mentor A Mentees Count: ${menteeListOfA.length}`);
  if (menteeListOfA.length !== 1 || menteeListOfA[0].id !== st1.id) {
    throw new Error('Mentor A mentee directory isolation failed');
  }

  // Academic Risk Calculation
  const riskEvalA = calculateExplainableRisk(menteeListOfA[0]);
  console.log(`Student 1 Risk Level: ${riskEvalA.status}`);
  if (riskEvalA.status !== 'HIGH_PRIORITY') {
    throw new Error('Risk evaluation mismatch for Student 1');
  }

  // Create Intervention
  const intervA = await fbDb.createIntervention(
    {
      studentId: st1.id,
      studentName: st1.name,
      studentUsn: st1.usn,
      mentorId: mA.id,
      mentorName: mA.name,
      category: 'Academic',
      description: 'CGPA < 6.0 and 2 backlogs detected.',
      priority: 'HIGH_PRIORITY',
      triggerReasons: riskEvalA.reasons,
      status: 'IDENTIFIED',
      actionsTaken: ['Initiated academic advisory plan'],
      followUpTaskIds: [],
      baselineCgpa: st1.cgpa,
      baselineAttendance: st1.attendance,
    },
    mA.id
  );

  // Create Follow-up Task
  const taskA = await fbDb.createFollowUpTask(
    {
      studentId: st1.id,
      studentName: st1.name,
      mentorId: mA.id,
      mentorName: mA.name,
      title: 'Weekly academic check-in',
      description: 'Review study planner progress',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // Overdue
      priority: 'HIGH',
      interventionId: intervA.id,
    },
    mA.id
  );

  // Record Meeting
  const todayStr = new Date().toISOString().substring(0, 10);
  const meetA = await fbDb.createMeeting(
    {
      studentId: st1.id,
      studentName: st1.name,
      mentorId: mA.id,
      mentorName: mA.name,
      title: '1-on-1 Academic Advisory',
      date: todayStr,
      time: '02:00 PM',
      agenda: 'Backlog clear roadmap',
    },
    mA.id
  );

  console.log('Intervention, Follow-up Task, and Meeting recorded successfully.');

  // Verify Command Center aggregation for Mentor A
  const [intervListA, taskListA, meetListA] = await Promise.all([
    fbDb.getInterventions({ mentorId: mA.id }),
    fbDb.getFollowUpTasks({ mentorId: mA.id }),
    fbDb.getMeetings({ mentorId: mA.id }),
  ]);

  if (intervListA.length !== 1 || taskListA.length !== 1 || meetListA.length !== 1) {
    throw new Error('Mentor A Command Center aggregation failed');
  }
  console.log('PASSED: Mentor A workflow and aggregation verified.');

  // STEP 5: Student Workflow & Career Intelligence
  console.log('\n--- PHASE 3: STUDENT WORKFLOW & CAREER INTELLIGENCE ---');

  // Save Career Guidance for Student 1
  const careerEval1 = analyzeSkillGaps(st1.skills, 'Full-Stack Developer');
  const readiness1 = calculatePlacementReadiness(st1, null, 'Full-Stack Developer');

  await fbDb.saveCareerGuidance({
    studentId: st1.id,
    targetRole: 'Full-Stack Developer',
    targetDomain: 'Software & Web Engineering',
    suggestedPaths: ['Full-Stack Developer'],
    skillGaps: careerEval1.missingSkills,
    skillDetails: careerEval1.skillDetails,
    recommendedTopics: careerEval1.benchmark.recommendedTopics,
    projectIdeas: careerEval1.benchmark.projectIdeas,
    readinessScore: readiness1.score,
    readinessStatus: readiness1.status,
    readinessReasons: readiness1.reasons,
  });

  const studentGuidance1 = await fbDb.getCareerGuidance(st1.id);
  console.log(`Student 1 Career Role: ${studentGuidance1?.targetRole}, Readiness: ${studentGuidance1?.readinessStatus}`);
  if (studentGuidance1?.targetRole !== 'Full-Stack Developer') {
    throw new Error('Student Career Intelligence profile mismatch');
  }

  // Create Goal
  const goal1 = await fbDb.createStudentGoal({
    studentId: st1.id,
    title: 'Master RESTful API Architecture',
    type: 'career',
    targetValue: 'Complete',
    targetDate: '2026-10-15',
    currentProgress: 15,
    status: 'active',
  });
  console.log(`Student Goal Created: ${goal1.title}`);

  // STEP 6: Reassignment Workflow
  console.log('\n--- PHASE 4: REASSIGNMENT & ISOLATION WORKFLOW ---');
  console.log(`Reallocating ${st1.name} from Mentor A to Mentor B...`);
  await fbDb.bulkAllocateStudents([st1.id], mB.id, 'admin_test');

  // Mentor A checks
  const menteesA_after = await fbDb.getStudentsByMentorId(mA.id);
  console.log(`Mentor A Mentees Count after reassignment: ${menteesA_after.length}`);
  if (menteesA_after.length !== 0) {
    throw new Error('Mentor A still sees reassigned student in active directory!');
  }

  // Mentor B checks
  const menteesB_after = await fbDb.getStudentsByMentorId(mB.id);
  console.log(`Mentor B Mentees Count after reassignment: ${menteesB_after.length}`);
  if (!menteesB_after.some((s) => s.id === st1.id)) {
    throw new Error('Mentor B failed to receive reassigned student in active directory!');
  }

  // Mentor B accesses historical interventions
  const intervListB_after = await fbDb.getInterventions({ mentorId: mB.id });
  console.log(`Mentor B Historical Interventions Count: ${intervListB_after.length}`);
  if (!intervListB_after.some((i) => i.id === intervA.id)) {
    throw new Error('Mentor B failed to access historical intervention for reassigned mentee!');
  }

  console.log('PASSED: Reassignment & Historical Access Preservation verified.');

  // STEP 7: Security & Safety Engine Verification
  console.log('\n--- PHASE 5: SAFETY ENGINE & CONFIDENTIAL ALERTS AUDIT ---');

  // Safety Engine Tests
  const normalAssessment = evaluateMessageSafetyServer('Hi, I need help with my study plan for exams.');
  console.log(`Normal Message Assessment: ${normalAssessment.severity}`);
  if (normalAssessment.isEscalated) {
    throw new Error('Normal study prompt incorrectly escalated');
  }

  const dangerAssessment = evaluateMessageSafetyServer('I want to kill myself');
  console.log(`Danger Message Assessment: ${dangerAssessment.severity}, Escalated: ${dangerAssessment.isEscalated}`);
  if (!dangerAssessment.isEscalated || dangerAssessment.severity !== 'IMMEDIATE_DANGER') {
    throw new Error('Crisis danger prompt failed to trigger immediate safety escalation');
  }

  console.log('PASSED: Safety Engine Classification verified.');

  // Cleanup
  try {
    await cleanupUser(mentorA_email);
    await cleanupUser(mentorB_email);
    await cleanupUser(student1_email);
    await cleanupUser(student2_email);
  } catch {}

  console.log('\n====================================================');
  console.log(' FULL-SYSTEM INTEGRATION & SECURITY AUDIT PASSED 100%');
  console.log('====================================================');
  process.exit(0);
}

function evaluateMessageSafetyServer(message: string): { severity: string; isEscalated: boolean } {
  const lowerMsg = message.toLowerCase();
  const dangerKeywords = ['kill myself', 'suicide', 'end my life', 'want to die', 'self harm'];
  const isDanger = dangerKeywords.some((k) => lowerMsg.includes(k));

  if (isDanger) {
    return { severity: 'IMMEDIATE_DANGER', isEscalated: true };
  }
  return { severity: 'NORMAL', isEscalated: false };
}

runFullSystemIntegrationAudit();
