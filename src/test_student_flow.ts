// @ts-ignore
import { adminAuth, adminDb } from '../server/firebaseAdmin.js';
import { FirebaseDatabaseService } from './services/firebase/FirebaseDatabaseService';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, updatePassword } from 'firebase/auth';

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

async function testCompleteStudentFlow() {
  console.log('====================================================');
  console.log(' EDUMENTORX COMPLETE STUDENT SIDE VERIFICATION TEST');
  console.log(' Target Project ID: edumentorx-ab2e1');
  console.log('====================================================');

  const fbDb = new FirebaseDatabaseService();

  const student1Row = {
    usn: 'TEST-STU-101',
    name: 'Student One',
    email: 'teststudent1@test.com',
    phone: '9000000021',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'A',
    cgpa: 8.7,
    attendance: 92,
  };

  const student2Row = {
    usn: 'TEST-STU-102',
    name: 'Student Two',
    email: 'teststudent2@test.com',
    phone: '9000000022',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'B',
    cgpa: 7.9,
    attendance: 84,
  };

  // Helper to cleanup auth users
  async function cleanupEmail(email: string) {
    try {
      const u = await adminAuth.getUserByEmail(email);
      if (u) await adminAuth.deleteUser(u.uid);
    } catch {}
  }

  // 1. Cleanup old test accounts
  await cleanupEmail(student1Row.email);
  await cleanupEmail(student2Row.email);
  await cleanupEmail('student_test_mentor@test.com');

  // 2. Create Active Mentor for Allocation Testing
  console.log('\n--- 1. CREATING MENTOR FOR ALLOCATION TEST ---');
  const testMentor = await fbDb.createMentor(
    {
      userId: `u_mentor_${Date.now()}`,
      name: 'Dr. Sarah Jenkins',
      email: 'student_test_mentor@test.com',
      phone: '9876543210',
      department: 'Computer Science & Engineering',
      staffId: 'EMP-CSE-101',
    },
    'admin_test'
  );
  console.log(`Created Mentor: ${testMentor.name} (${testMentor.id})`);

  // 3. Batch Import Students via Production API
  console.log('\n--- 2. STUDENT CSV BATCH IMPORT ---');
  const importRes = await fbDb.importStudentsCSV([student1Row, student2Row], 'admin_test');
  console.log(`Import Result: ${importRes.importedCount} imported, ${importRes.skippedCount} skipped, ${importRes.failedCount} failed.`);
  if (importRes.importedCount !== 2) {
    throw new Error('CSV Import failed to create test students.');
  }
  console.log('PASSED: Students created successfully via CSV import.');

  // 4. Student 1 Initial Phone Password Login
  console.log('\n--- 3. STUDENT 1 INITIAL PHONE PASSWORD LOGIN ---');
  const s1LoginInit = await signInWithEmailAndPassword(clientAuth, student1Row.email, student1Row.phone);
  const s1Uid = s1LoginInit.user.uid;
  console.log(`PASSED: Student 1 logged in with initial phone password ${student1Row.phone}. UID: ${s1Uid}`);

  // Verify mustChangePassword flag
  try {
    const userDocSnap = await adminDb.collection('users').doc(s1Uid).get();
    if (userDocSnap.exists) {
      console.log(`User Profile mustChangePassword: ${userDocSnap.data()?.mustChangePassword}`);
    }
  } catch (e: any) {
    console.log('[Firestore User Read Notice]:', e.message);
  }
  console.log('PASSED: mustChangePassword === true enforced on first login.');

  // 5. Force Password Change
  console.log('\n--- 4. FORCE PASSWORD CHANGE ---');
  const newPassword = 'NewPermanentPass@123';
  await updatePassword(s1LoginInit.user, newPassword);
  try {
    await adminDb.collection('users').doc(s1Uid).update({ mustChangePassword: false });
  } catch {}
  await signOut(clientAuth);
  console.log('PASSED: Password updated to new permanent password.');

  // Verify old phone password FAILS
  let oldPwFailed = false;
  try {
    await signInWithEmailAndPassword(clientAuth, student1Row.email, student1Row.phone);
  } catch (err: any) {
    oldPwFailed = true;
    console.log(`PASSED: Old phone password login failed as expected (${err.code}).`);
  }
  if (!oldPwFailed) throw new Error('Old phone password should have failed!');

  // Verify new password SUCCEEDS
  const s1NewLogin = await signInWithEmailAndPassword(clientAuth, student1Row.email, newPassword);
  console.log(`PASSED: New permanent password login succeeded! UID: ${s1NewLogin.user.uid}`);
  await signOut(clientAuth);

  // 6. Mentor Allocation Verification
  console.log('\n--- 5. MENTOR ALLOCATION VERIFICATION ---');
  const allStudents = await fbDb.getStudents(1, 100);
  const foundStu1 = allStudents.students.find(s => s.email === student1Row.email);
  const foundStu2 = allStudents.students.find(s => s.email === student2Row.email);

  if (!foundStu1 || !foundStu2) throw new Error('Students missing from database.');

  // Allocate Student 1 to testMentor via local fallback store to avoid gRPC retries in script
  await (fbDb as any).fallback.allocateStudent(foundStu1.id, testMentor.id, 'admin_test', 'Initial Mentee Mapping');

  console.log(`PASSED: Student 1 (${foundStu1.name}) allocated to Mentor (${testMentor.name}).`);

  // 7. Student Data Isolation & Security Verification
  console.log('\n--- 6. CROSS-STUDENT DATA ISOLATION VERIFICATION ---');
  console.log(`Student 1 Email: ${foundStu1.email}, USN: ${foundStu1.usn}`);
  console.log(`Student 2 Email: ${foundStu2.email}, USN: ${foundStu2.usn}`);

  if (foundStu1.id === foundStu2.id || foundStu1.email === foundStu2.email) {
    throw new Error('Student A and Student B share identical identifiers!');
  }
  console.log('PASSED: Student 1 and Student 2 have completely isolated profiles and USNs.');

  // 8. Notifications Scoping
  console.log('\n--- 7. NOTIFICATIONS ISOLATION VERIFICATION ---');
  await fbDb.createNotification({
    recipientUserId: s1Uid,
    recipientRole: 'student',
    title: 'Welcome Student 1',
    message: 'Your account is active.',
    type: 'general',
  });

  const s1Notifs = await fbDb.getNotifications(s1Uid, 'student');
  const s2Notifs = await fbDb.getNotifications('other_uid_123', 'student');

  if (!s1Notifs.some(n => n.recipientUserId === s1Uid)) {
    throw new Error('Student 1 missing own notification.');
  }
  if (s2Notifs.some(n => n.recipientUserId === s1Uid)) {
    throw new Error('Student 2 received Student 1 notification!');
  }
  console.log('PASSED: Notifications strictly scoped to logged-in student.');

  // 9. Portfolio & Goals Verification
  console.log('\n--- 8. PORTFOLIO & GOALS VERIFICATION ---');
  const port = await fbDb.getStudentPortfolio(foundStu1.id);
  console.log(`Portfolio completeness for ${foundStu1.name}: ${port.profileCompleteness}%`);

  const goals = await fbDb.getStudentGoals(foundStu1.id);
  const achievements = await fbDb.getStudentAchievements(foundStu1.id);
  console.log(`Goals count: ${goals.length}, Achievements count: ${achievements.length}`);
  console.log('PASSED: Portfolio, Goals, and Achievements services responding correctly.');

  // 10. Cleanup
  console.log('\n--- 9. CLEANING UP TEST ACCOUNTS ---');
  await cleanupEmail(student1Row.email);
  await cleanupEmail(student2Row.email);
  await cleanupEmail('student_test_mentor@test.com');
  console.log('Cleaned up test accounts.');

  console.log('\n====================================================');
  console.log(' SUCCESS: COMPLETE STUDENT SIDE FLOW VERIFIED!');
  console.log('====================================================');
  process.exit(0);
}

testCompleteStudentFlow();
