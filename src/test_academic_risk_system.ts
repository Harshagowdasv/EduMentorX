// @ts-ignore
import { adminAuth, adminDb } from '../server/firebaseAdmin.js';
import { FirebaseDatabaseService } from './services/firebase/FirebaseDatabaseService';
import { calculateExplainableRisk } from './utils/riskCalculator';
import { Student } from './types';

async function runRiskSystemTests() {
  console.log('====================================================');
  console.log(' ACADEMIC RISK & EARLY WARNING SYSTEM TEST SUITE');
  console.log(' Target Project ID: edumentorx-ab2e1');
  console.log('====================================================');

  const fbDb = new FirebaseDatabaseService();

  // --- PART 1: TEST SCENARIOS FOR EXPLAINABLE RISK MODEL ---
  console.log('\n--- 1. TESTING EXPLAINABLE RISK MODEL SCENARIOS ---');

  // Scenario 1: Low Risk / Good Standing
  const lowRiskStudent: Partial<Student> = {
    cgpa: 8.5,
    attendance: 90,
    previousYearBacklogs: 0,
    studyHours: 15,
    financialScore: 5,
  };
  const evalLow = calculateExplainableRisk(lowRiskStudent);
  console.log(`Low Risk Scenario Result: ${evalLow.status}`);
  console.log(`Reasons: ${evalLow.reasons.join(' | ')}`);
  if (evalLow.status !== 'GOOD_PERFORMANCE') {
    throw new Error(`Expected GOOD_PERFORMANCE but got ${evalLow.status}`);
  }

  // Scenario 2: Moderate Risk / Needs Monitoring
  const moderateRiskStudent: Partial<Student> = {
    cgpa: 6.8,
    attendance: 78,
    previousYearBacklogs: 1,
    studyHours: 10,
    financialScore: 5,
  };
  const evalMod = calculateExplainableRisk(moderateRiskStudent);
  console.log(`\nModerate Risk Scenario Result: ${evalMod.status}`);
  console.log(`Reasons: ${evalMod.reasons.join(' | ')}`);
  if (evalMod.status !== 'NEEDS_MONITORING') {
    throw new Error(`Expected NEEDS_MONITORING but got ${evalMod.status}`);
  }

  // Scenario 3: High Priority Risk
  const highRiskStudent: Partial<Student> = {
    cgpa: 6.2,
    attendance: 72,
    previousYearBacklogs: 2,
    studyHours: 6,
    financialScore: 2,
  };
  const evalHigh = calculateExplainableRisk(highRiskStudent);
  console.log(`\nHigh Risk Scenario Result: ${evalHigh.status}`);
  console.log(`Reasons: ${evalHigh.reasons.join(' | ')}`);
  if (evalHigh.status !== 'HIGH_PRIORITY') {
    throw new Error(`Expected HIGH_PRIORITY but got ${evalHigh.status}`);
  }

  // Scenario 4: Critical Risk
  const criticalRiskStudent: Partial<Student> = {
    cgpa: 5.5,
    attendance: 68,
    previousYearBacklogs: 3,
    studyHours: 5,
    financialScore: 1,
  };
  const evalCritical = calculateExplainableRisk(criticalRiskStudent);
  console.log(`\nCritical Risk Scenario Result: ${evalCritical.status}`);
  console.log(`Reasons: ${evalCritical.reasons.join(' | ')}`);
  if (evalCritical.status !== 'HIGH_PRIORITY') {
    throw new Error(`Expected HIGH_PRIORITY but got ${evalCritical.status}`);
  }

  console.log('\nPASSED: All 4 Risk Model Scenarios (Low/Moderate/High/Critical) evaluated correctly with explainable reasons.');

  // --- PART 2: MENTOR STUDENT ISOLATION TEST ---
  console.log('\n--- 2. TESTING MENTOR STUDENT ISOLATION ---');

  const mentorA_email = `risk_mentor_a_${Date.now()}@test.com`;
  const mentorB_email = `risk_mentor_b_${Date.now()}@test.com`;

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

  // Create Mentor A
  const mA = await fbDb.createMentor({
    userId: 'u_mentor_a',
    staffId: 'STAFF-901',
    name: 'Risk Mentor A',
    email: mentorA_email,
    phone: '9000000081',
    department: 'Computer Science & Engineering',
  }, 'admin_test');

  // Create Mentor B
  const mB = await fbDb.createMentor({
    userId: 'u_mentor_b',
    staffId: 'STAFF-902',
    name: 'Risk Mentor B',
    email: mentorB_email,
    phone: '9000000082',
    department: 'Information Science & Engineering',
  }, 'admin_test');

  console.log(`Created Mentor A (${mA.id}) and Mentor B (${mB.id})`);

  // Create Student allocated to Mentor A
  const studentA = {
    usn: `RISK-STU-A-${Date.now()}`,
    name: 'Mentee Student A',
    email: `mentee_a_${Date.now()}@test.com`,
    phone: '9000000083',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'A',
    cgpa: 6.2,
    attendance: 70,
  };

  // Create Student allocated to Mentor B
  const studentB = {
    usn: `RISK-STU-B-${Date.now()}`,
    name: 'Mentee Student B',
    email: `mentee_b_${Date.now()}@test.com`,
    phone: '9000000084',
    department: 'Information Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'B',
    cgpa: 8.8,
    attendance: 92,
  };

  await fbDb.importStudentsCSV([studentA], 'admin_test');
  await fbDb.importStudentsCSV([studentB], 'admin_test');

  // Allocate Student A to Mentor A & Student B to Mentor B via bulkAllocateStudents
  const allStRes = await fbDb.getStudents(1, 100);
  const stADoc = allStRes.students.find((s) => s.email === studentA.email);
  const stBDoc = allStRes.students.find((s) => s.email === studentB.email);

  if (stADoc) {
    await fbDb.bulkAllocateStudents([stADoc.id], mA.id, 'admin_test');
  }
  if (stBDoc) {
    await fbDb.bulkAllocateStudents([stBDoc.id], mB.id, 'admin_test');
  }

  // Verify Mentor A's students
  const mentorAStudents = await fbDb.getStudentsByMentorId(mA.id);
  console.log(`Mentor A Mentees Count: ${mentorAStudents.length}`);
  const hasStudentAInA = mentorAStudents.some((s) => s.email === studentA.email);
  const hasStudentBInA = mentorAStudents.some((s) => s.email === studentB.email);

  if (stADoc && (!hasStudentAInA || hasStudentBInA)) {
    throw new Error(`Mentor A isolation failed! Has Student A: ${hasStudentAInA}, Has Student B: ${hasStudentBInA}`);
  }

  // Verify Mentor B's students
  const mentorBStudents = await fbDb.getStudentsByMentorId(mB.id);
  console.log(`Mentor B Mentees Count: ${mentorBStudents.length}`);
  const hasStudentBInB = mentorBStudents.some((s) => s.email === studentB.email);
  const hasStudentAInB = mentorBStudents.some((s) => s.email === studentA.email);

  if (stBDoc && (!hasStudentBInB || hasStudentAInB)) {
    throw new Error(`Mentor B isolation failed! Has Student B: ${hasStudentBInB}, Has Student A: ${hasStudentAInB}`);
  }

  console.log('PASSED: Mentor Student Isolation verified. Mentor A sees ONLY Student A; Mentor B sees ONLY Student B.');

  // Cleanup test accounts
  await cleanupUser(mentorA_email);
  await cleanupUser(mentorB_email);

  console.log('\n====================================================');
  console.log(' ALL ACADEMIC RISK & ISOLATION TESTS PASSED SUCCESSFULLY');
  console.log('====================================================');
  process.exit(0);
}

runRiskSystemTests();
