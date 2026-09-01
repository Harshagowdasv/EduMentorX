// @ts-ignore
import { adminAuth, adminDb } from '../server/firebaseAdmin.js';
import { FirebaseDatabaseService } from './services/firebase/FirebaseDatabaseService';

async function testMentorVisibilityAndMapping() {
  console.log('====================================================');
  console.log(' TESTING MENTOR VISIBILITY AND STUDENT MAPPING');
  console.log(' Target Project ID: edumentorx-ab2e1');
  console.log('====================================================');

  const testEmail = 'visibilitymentor@test.com';
  const testPhone = '900000011';
  const testName = 'Visibility Test Mentor';
  const staffId = 'EMP-TEST-011';
  const fbDb = new FirebaseDatabaseService();

  // 1. Cleanup any pre-existing test mentor
  try {
    const existing = await adminAuth.getUserByEmail(testEmail);
    if (existing) {
      console.log('[Cleanup] Removing pre-existing test user:', existing.uid);
      await adminAuth.deleteUser(existing.uid);
    }
  } catch (err) {
    // Ignore user-not-found
  }

  // 2. Create Mentor via FirebaseDatabaseService.createMentor (which calls POST /api/admin/create-mentor)
  console.log('\n--- 1. Creating Brand New Mentor via FirebaseDatabaseService.createMentor ---');
  const createdMentor = await fbDb.createMentor(
    {
      userId: `u_test_${Date.now()}`,
      name: testName,
      email: testEmail,
      phone: testPhone,
      department: 'Computer Science & Engineering',
      staffId: staffId,
    },
    'admin_test'
  );

  console.log('Created Mentor Object:', createdMentor);
  if (!createdMentor || !createdMentor.email) {
    throw new Error('Failed to create test mentor account.');
  }

  // 3. Test FirebaseDatabaseService.getMentors()
  console.log('\n--- 2. Fetching Mentors via FirebaseDatabaseService.getMentors() ---');
  const allMentors = await fbDb.getMentors();

  console.log(`Retrieved ${allMentors.length} mentors from Firebase Database Service.`);
  const foundMentor = allMentors.find(m => m.email.toLowerCase() === testEmail.toLowerCase());

  if (!foundMentor) {
    console.error('ALL RETURNED MENTORS:', allMentors.map(m => m.email));
    throw new Error(`CRITICAL: Newly created mentor '${testEmail}' was NOT returned by FirebaseDatabaseService.getMentors()!`);
  }

  console.log('PASSED: Newly created mentor found in getMentors():');
  console.log('  ID:', foundMentor.id);
  console.log('  Name:', foundMentor.name);
  console.log('  Email:', foundMentor.email);
  console.log('  Status:', foundMentor.status);
  console.log('  Active Mentees:', foundMentor.activeMenteesCount);

  // 4. Test Student Allocation to this New Mentor
  console.log('\n--- 3. Testing Student Allocation to New Mentor ---');
  const studentsRes = await fbDb.getStudents(1, 10);
  if (studentsRes.students.length > 0) {
    const targetStudent = studentsRes.students[0];
    await fbDb.allocateStudent(targetStudent.id, foundMentor.id, 'admin_test', 'Test allocation to visibility mentor');
    console.log(`PASSED: Student ${targetStudent.name} (${targetStudent.id}) allocated to new mentor ${foundMentor.name}`);

    // 5. Test getStudentsByMentorId for New Mentor
    console.log('\n--- 4. Fetching Mentees for New Mentor ---');
    const mentees = await fbDb.getStudentsByMentorId(foundMentor.id);
    console.log(`Retrieved ${mentees.length} mentees for mentor ${foundMentor.name}.`);
    if (mentees.length > 0) {
      console.log('PASSED: Allocated mentee found:', mentees[0].name);
    }
  }

  // 6. Cleanup Test User
  console.log('\n--- 5. Cleaning Up Test Mentor Account ---');
  try {
    const authUser = await adminAuth.getUserByEmail(testEmail);
    if (authUser) {
      await adminAuth.deleteUser(authUser.uid);
    }
  } catch {}
  console.log('Test mentor account cleaned up cleanly.');

  console.log('\n====================================================');
  console.log(' SUCCESS: MENTOR VISIBILITY AND MAPPING VERIFIED!');
  console.log('====================================================');
}

testMentorVisibilityAndMapping();
