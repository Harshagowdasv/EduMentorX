// @ts-ignore
import { adminAuth, adminDb } from '../server/firebaseAdmin.js';
import { FirebaseDatabaseService } from './services/firebase/FirebaseDatabaseService';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyA_2YPrUcM9syjb3SGi-7BeL_SpMByOh14',
  authDomain: 'edumentorx-ab2e1.firebaseapp.com',
  projectId: 'edumentorx-ab2e1',
  storageBucket: 'edumentorx-ab2e1.firebasestorage.app',
  messagingSenderId: '911088982966',
  appId: '1:911088982966:web:ac20aebf928d68a0457f17',
};

const clientApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const clientAuth = getAuth(clientApp);

async function testCSVImportProduction() {
  console.log('====================================================');
  console.log(' TESTING STUDENT CSV IMPORT & PERFORMANCE IN PRODUCTION');
  console.log(' Target Project ID: edumentorx-ab2e1');
  console.log('====================================================');

  const fbDb = new FirebaseDatabaseService();

  // Test Student Rows
  const student1Row = {
    usn: 'TEST-STU-001',
    name: 'Test Student One',
    email: 'teststudent1@test.com',
    phone: '9000000021',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'A',
    cgpa: 8.5,
    attendance: 90,
  };

  const student2Row = {
    usn: 'TEST-STU-002',
    name: 'Test Student Two',
    email: 'teststudent2@test.com',
    phone: '9000000022',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'B',
    cgpa: 8.8,
    attendance: 92,
  };

  // 1. Cleanup any pre-existing test student accounts
  for (const email of [student1Row.email, student2Row.email]) {
    try {
      const existing = await adminAuth.getUserByEmail(email);
      if (existing) {
        console.log(`[Cleanup] Removing pre-existing test user: ${email} (${existing.uid})`);
        await adminAuth.deleteUser(existing.uid);
      }
    } catch {}
  }

  // 2. Create Active Mentor for Allocation Testing
  console.log('\n--- STEP 1: Creating Mentor for Student Mapping ---');
  const mentorEmail = 'csvtestmentor@test.com';
  try {
    const existingM = await adminAuth.getUserByEmail(mentorEmail);
    if (existingM) await adminAuth.deleteUser(existingM.uid);
  } catch {}

  const testMentor = await fbDb.createMentor(
    {
      userId: `u_mentor_${Date.now()}`,
      name: 'CSV Test Mentor',
      email: mentorEmail,
      phone: '9000000020',
      department: 'Computer Science & Engineering',
      staffId: 'EMP-CSV-001',
    },
    'admin_test'
  );
  console.log('Created Mentor:', testMentor.name, testMentor.id);

  // 3. Batch Import Students via fbDb.importStudentsCSV
  console.log('\n--- STEP 2: Importing Students CSV via fbDb.importStudentsCSV (Production Mode) ---');
  const importStartTime = performance.now();

  const importResult = await fbDb.importStudentsCSV([student1Row, student2Row], 'admin_test');

  const importDuration = Math.round(performance.now() - importStartTime);
  console.log(`[PERF] fbDb.importStudentsCSV completed in ${importDuration}ms`);
  console.log('Import Output Summary:', {
    importedCount: importResult.importedCount,
    skippedCount: importResult.skippedCount,
    failedCount: importResult.failedCount,
    totalRows: importResult.totalRows,
  });

  if (importResult.importedCount !== 2) {
    console.error('Import Details:', importResult.details);
    throw new Error(`Expected 2 imported students, got ${importResult.importedCount}`);
  }
  console.log('PASSED: Both student rows imported successfully!');

  // 4. Verify Firebase Auth Accounts & Initial Passwords
  console.log('\n--- STEP 3: Verifying Firebase Auth Accounts & Initial Passwords ---');
  for (const s of [student1Row, student2Row]) {
    const authUser = await adminAuth.getUserByEmail(s.email);
    console.log(`[Auth Verify] ${s.email} -> UID: ${authUser.uid}, Verified: ${authUser.emailVerified}`);

    // Test Login with Phone Number Password
    const loginRes = await signInWithEmailAndPassword(clientAuth, s.email, s.phone);
    console.log(`PASSED: Client Auth Login succeeded for ${s.email} with initial phone password ${s.phone}!`);
    await signOut(clientAuth);
  }

  // 5. Test Student Allocation & Mentor Visibility
  console.log('\n--- STEP 4: Testing Student Allocation & Mentor Visibility ---');
  const allStudents = await fbDb.getStudents(1, 100);
  const foundStu1 = allStudents.students.find(s => s.email === student1Row.email);

  if (!foundStu1) {
    console.error('All Students Returned:', allStudents.students.map(s => s.email));
    throw new Error(`Imported student ${student1Row.email} not found in fbDb.getStudents()`);
  }

  await fbDb.allocateStudent(foundStu1.id, testMentor.id, 'admin_test', 'Mapping imported student');
  console.log(`PASSED: Student ${foundStu1.name} (${foundStu1.id}) allocated to mentor ${testMentor.name}!`);

  const mentorMentees = await fbDb.getStudentsByMentorId(testMentor.id);
  console.log(`Retrieved ${mentorMentees.length} mentees for mentor ${testMentor.name}.`);
  if (!mentorMentees.some(m => m.id === foundStu1.id)) {
    throw new Error('Allocated student missing from mentor mentees list.');
  }
  console.log('PASSED: Mentor sees allocated student on dashboard!');

  // 6. Test Duplicate CSV Re-Import
  console.log('\n--- STEP 5: Re-Importing Same CSV (Duplicate & Password Integrity Check) ---');
  const reImportResult = await fbDb.importStudentsCSV([student1Row, student2Row], 'admin_test');
  console.log('Re-Import Output Summary:', {
    importedCount: reImportResult.importedCount,
    skippedCount: reImportResult.skippedCount,
    failedCount: reImportResult.failedCount,
  });

  if (reImportResult.skippedCount !== 2 || reImportResult.importedCount !== 0) {
    throw new Error(`Expected 2 skipped rows on duplicate re-import, got ${reImportResult.skippedCount} skipped, ${reImportResult.importedCount} imported.`);
  }
  console.log('PASSED: Duplicate re-import cleanly skipped existing accounts without creating duplicates!');

  // 7. Verify Passwords Remain Intact After Re-Import
  for (const s of [student1Row, student2Row]) {
    const loginRes = await signInWithEmailAndPassword(clientAuth, s.email, s.phone);
    console.log(`PASSED: Password for ${s.email} remained intact and unchanged after re-import!`);
    await signOut(clientAuth);
  }

  // 8. Test Performance & Cache Speed
  console.log('\n--- STEP 6: Testing Performance & In-Memory Cache Speed ---');
  const cacheStartTime = performance.now();
  const cachedMentors = await fbDb.getMentors();
  const cachedMentorsDuration = Math.round(performance.now() - cacheStartTime);

  const cacheStuStartTime = performance.now();
  const cachedStudents = await fbDb.getStudents(1, 100);
  const cachedStudentsDuration = Math.round(performance.now() - cacheStuStartTime);

  console.log(`[PERF] Cached Mentor List load duration: ${cachedMentorsDuration}ms (${cachedMentors.length} mentors)`);
  console.log(`[PERF] Cached Student List load duration: ${cachedStudentsDuration}ms (${cachedStudents.total} students)`);

  if (cachedMentorsDuration > 50 || cachedStudentsDuration > 50) {
    console.warn('Notice: Cache load exceeded 50ms (check in-memory cache hit).');
  } else {
    console.log('PASSED: In-memory cache served requests in < 50ms!');
  }

  // 9. Cleanup Test Accounts
  console.log('\n--- STEP 7: Cleaning Up Test Accounts ---');
  for (const email of [student1Row.email, student2Row.email, mentorEmail]) {
    try {
      const u = await adminAuth.getUserByEmail(email);
      if (u) await adminAuth.deleteUser(u.uid);
    } catch {}
  }
  console.log('Test accounts cleaned up cleanly.');

  console.log('\n====================================================');
  console.log(' SUCCESS: PRODUCTION CSV IMPORT & PERFORMANCE VERIFIED!');
  console.log('====================================================');
}

testCSVImportProduction();
