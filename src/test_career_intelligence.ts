// @ts-ignore
import { adminAuth, adminDb } from '../server/firebaseAdmin.js';
import { FirebaseDatabaseService } from './services/firebase/FirebaseDatabaseService';
import {
  analyzeSkillGaps,
  calculatePlacementReadiness,
  ROLE_BENCHMARKS
} from './utils/careerIntelligenceEngine';
import { Student, StudentPortfolio } from './types';

async function runCareerIntelligenceTests() {
  console.log('====================================================');
  console.log(' STUDENT CAREER & PLACEMENT INTELLIGENCE TEST SUITE');
  console.log(' Target Project ID: edumentorx-ab2e1');
  console.log('====================================================');

  const fbDb = new FirebaseDatabaseService();

  // --- TEST 1: SKILL GAP CALCULATION ---
  console.log('\n--- TEST 1: SKILL GAP ANALYSIS ENGINE ---');
  const studentSkills = ['React', 'TypeScript', 'Node.js', 'Git'];
  const targetRole = 'Full-Stack Developer';

  const gapResult = analyzeSkillGaps(studentSkills, targetRole);
  console.log(`Target Role: ${targetRole}`);
  console.log(`Strong Skills Found: ${gapResult.strongSkills.join(', ')}`);
  console.log(`Missing Skills Found: ${gapResult.missingSkills.join(', ')}`);

  if (!gapResult.strongSkills.includes('React') || !gapResult.strongSkills.includes('TypeScript')) {
    throw new Error('Skill gap engine failed to detect strong matching skills');
  }
  if (!gapResult.missingSkills.includes('SQL / PostgreSQL / MongoDB')) {
    throw new Error('Skill gap engine failed to detect missing essential skill');
  }
  console.log('PASSED: Deterministic Skill Gap Analysis Engine verified.');

  // --- TEST 2: EXPLAINABLE PLACEMENT READINESS SCORE & INSUFFICIENT DATA ---
  console.log('\n--- TEST 2: READINESS EVALUATION & INSUFFICIENT DATA STATE ---');

  // Insufficient Data Student
  const emptyStudent: Partial<Student> = { cgpa: 0, skills: [] };
  const emptyPortfolio: StudentPortfolio = {
    studentId: 'st_empty',
    extracurriculars: [],
    certificates: [],
    projects: [],
    codingProfiles: {},
    profileCompleteness: 0,
    missingSuggestions: [],
  };

  const emptyEval = calculatePlacementReadiness(emptyStudent, emptyPortfolio, targetRole);
  console.log(`Empty Profile Readiness Status: ${emptyEval.status}`);
  console.log(`Reasons: ${emptyEval.reasons.join(' | ')}`);
  if (emptyEval.status !== 'INSUFFICIENT_DATA') {
    throw new Error(`Expected INSUFFICIENT_DATA status but got ${emptyEval.status}`);
  }

  // Placement-Ready Student
  const readyStudent: Partial<Student> = {
    cgpa: 8.5,
    skills: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'SQL / PostgreSQL / MongoDB', 'Git'],
    github: 'https://github.com/ready_student',
    leetcode: 'https://leetcode.com/ready_student',
    previousYearBacklogs: 0,
  };
  const readyPortfolio: StudentPortfolio = {
    studentId: 'st_ready',
    extracurriculars: [],
    certificates: [{ id: 'c1', title: 'AWS Cert', organization: 'AWS', date: '2025-01-01', certificateUrl: 'https://cert.com' }],
    projects: [
      { id: 'p1', title: 'E-Commerce Platform', description: 'React & Node.js', githubUrl: 'https://github.com/p1', technologies: ['React'] },
      { id: 'p2', title: 'Log Service', description: 'TypeScript & Go', githubUrl: 'https://github.com/p2', technologies: ['Go'] },
    ],
    codingProfiles: { github: 'https://github.com/ready_student' },
    resumeUrl: 'https://example.com/resume.pdf',
    profileCompleteness: 95,
    missingSuggestions: [],
  };

  const readyEval = calculatePlacementReadiness(readyStudent, readyPortfolio, targetRole);
  console.log(`\nPlacement-Ready Score: ${readyEval.score} / 100, Status: ${readyEval.status}`);
  console.log(`Reasons: ${readyEval.reasons.join(' | ')}`);

  if (readyEval.status !== 'PLACEMENT_READY' || readyEval.score < 75) {
    throw new Error(`Expected PLACEMENT_READY with score >= 75 but got status ${readyEval.status}, score ${readyEval.score}`);
  }
  console.log('PASSED: Explainable Placement Readiness & Insufficient Data State verified.');

  // --- TEST 3: STUDENT A/B ISOLATION & GOAL INTEGRATION ---
  console.log('\n--- TEST 3: STUDENT ISOLATION & ADD TO GOALS ---');

  const studentA_email = `career_stu_a_${Date.now()}@test.com`;
  const studentB_email = `career_stu_b_${Date.now()}@test.com`;

  async function cleanupUser(email: string) {
    try {
      const u = await adminAuth.getUserByEmail(email);
      if (u) {
        await adminAuth.deleteUser(u.uid);
        await adminDb.collection('users').doc(u.uid).delete();
        await adminDb.collection('students').doc(u.uid).delete();
      }
    } catch {}
  }

  await cleanupUser(studentA_email);
  await cleanupUser(studentB_email);

  const studentA_data = {
    usn: `CAR-STU-A-${Date.now()}`,
    name: 'Career Student A',
    email: studentA_email,
    phone: '9000000111',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'A',
    cgpa: 8.2,
    skills: ['React', 'TypeScript'],
    careerGoal: 'Full-Stack Developer',
  };

  const studentB_data = {
    usn: `CAR-STU-B-${Date.now()}`,
    name: 'Career Student B',
    email: studentB_email,
    phone: '9000000112',
    department: 'Information Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'B',
    cgpa: 7.5,
    skills: ['Python', 'SQL'],
    careerGoal: 'Data Analyst / Data Scientist',
  };

  await fbDb.importStudentsCSV([studentA_data], 'admin_test');
  await fbDb.importStudentsCSV([studentB_data], 'admin_test');

  const allStRes = await fbDb.getStudents(1, 100);
  const stADoc = allStRes.students.find((s) => s.email === studentA_email);
  const stBDoc = allStRes.students.find((s) => s.email === studentB_email);

  if (!stADoc || !stBDoc) throw new Error('Failed to load created test students');

  // Save Career Guidance for Student A
  await fbDb.saveCareerGuidance({
    studentId: stADoc.id,
    targetRole: 'Full-Stack Developer',
    targetDomain: 'Software & Web Engineering',
    suggestedPaths: ['Full-Stack Developer'],
    skillGaps: ['SQL'],
    recommendedTopics: ['REST APIs'],
    projectIdeas: ['Build E-Commerce App'],
    readinessScore: 70,
    readinessStatus: 'INTERMEDIATE',
  });

  // Save Career Guidance for Student B
  await fbDb.saveCareerGuidance({
    studentId: stBDoc.id,
    targetRole: 'Data Analyst / Data Scientist',
    targetDomain: 'Data & Analytics',
    suggestedPaths: ['Data Analyst'],
    skillGaps: ['Machine Learning'],
    recommendedTopics: ['Exploratory Data Analysis'],
    projectIdeas: ['Build Churn Analytics Dashboard'],
    readinessScore: 65,
    readinessStatus: 'INTERMEDIATE',
  });

  // Verify Student A's career guidance
  const guidA = await fbDb.getCareerGuidance(stADoc.id);
  const guidB = await fbDb.getCareerGuidance(stBDoc.id);

  console.log(`Student A Target Role: ${guidA?.targetRole}`);
  console.log(`Student B Target Role: ${guidB?.targetRole}`);

  if (guidA?.targetRole !== 'Full-Stack Developer' || guidB?.targetRole !== 'Data Analyst / Data Scientist') {
    throw new Error('Career guidance student isolation failed');
  }

  // Add recommendation to Student A's goals
  const goalA = await fbDb.createStudentGoal({
    studentId: stADoc.id,
    title: 'Career Prep: Master REST APIs',
    type: 'career',
    targetValue: 'Complete',
    targetDate: '2026-10-01',
    currentProgress: 20,
    status: 'active',
  });

  console.log(`Created Goal for Student A: ${goalA.title}`);
  const goalsA = await fbDb.getStudentGoals(stADoc.id);
  if (!goalsA.some((g) => g.id === goalA.id)) {
    throw new Error('Failed to add career recommendation to Student A goals');
  }

  console.log('PASSED: Student Career Isolation and Add-to-Goals integration verified.');

  // Cleanup
  try {
    await cleanupUser(studentA_email);
    await cleanupUser(studentB_email);
    await adminDb.collection('students').doc(stADoc.id).delete().catch(() => null);
    await adminDb.collection('students').doc(stBDoc.id).delete().catch(() => null);
  } catch {}

  console.log('\n====================================================');
  console.log(' ALL CAREER INTELLIGENCE TESTS PASSED SUCCESSFULLY');
  console.log('====================================================');
  process.exit(0);
}

runCareerIntelligenceTests();
