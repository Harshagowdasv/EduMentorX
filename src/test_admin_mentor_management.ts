import { DemoAuthService } from './services/demo/DemoAuthService';
import { DemoDatabaseService } from './services/demo/DemoDatabaseService';

async function testAdminMentorManagement() {
  console.log('====================================================');
  console.log(' TESTING ADMIN MENTOR MANAGEMENT FULL LIFECYCLE');
  console.log('====================================================');

  const auth = new DemoAuthService();
  const db = new DemoDatabaseService();

  // PART 6: BRAND NEW TEST MENTOR
  const newMentorEmail = 'mentortest2@test.com';
  const newMentorPhone = '9000000003';
  const newMentorName = 'Test Mentor 2';
  const staffId = 'EMP-CS-999';

  console.log('\n--- 1. Creating Brand New Mentor (mentortest2@test.com) ---');
  try {
    const createdMentor = await db.createMentor(
      {
        userId: 'u_test_mentor_2',
        name: newMentorName,
        email: newMentorEmail,
        phone: newMentorPhone,
        department: 'Computer Science & Engineering',
        staffId: staffId,
      },
      'admin_1'
    );

    console.log('Mentor Created Successfully:', createdMentor.name, 'ID:', createdMentor.id);
    console.log('Status:', createdMentor.status);

    // Initial Login Test
    console.log('\n--- 2. Initial Login with Phone Password (9000000003) ---');
    const user = await auth.login({
      email: newMentorEmail,
      password: newMentorPhone,
      role: 'mentor',
    });

    console.log('Login Succeeded for:', user.email);
    console.log('mustChangePassword:', user.mustChangePassword);

    if (!user.mustChangePassword) {
      throw new Error('Expected mustChangePassword to be TRUE on first login.');
    }

    // Force Password Change Test
    console.log('\n--- 3. Changing Password to Permanent Password ---');
    await auth.changePassword(newMentorPhone, 'NewPermanentPass123!');
    const updatedUser = await auth.getCurrentUser();
    console.log('mustChangePassword after update:', updatedUser?.mustChangePassword);

    // Logout
    await auth.logout();
    console.log('Logged out successfully.');

    // Verify Old Phone Password Fails
    console.log('\n--- 4. Verifying Old Phone Password Fails ---');
    try {
      await auth.login({
        email: newMentorEmail,
        password: newMentorPhone,
        role: 'mentor',
      });
      throw new Error('Old phone password login should have failed!');
    } catch (err: any) {
      console.log('PASSED: Old password rejected with message:', err.message);
    }

    // Verify New Permanent Password Succeeds
    console.log('\n--- 5. Verifying New Permanent Password Succeeds ---');
    const permanentUser = await auth.login({
      email: newMentorEmail,
      password: 'NewPermanentPass123!',
      role: 'mentor',
    });
    console.log('PASSED: Permanent password login succeeded!');
    await auth.logout();

    // PART 7: DEACTIVATE & REACTIVATE MENTOR
    console.log('\n--- 6. Deactivating Mentor ---');
    await db.deactivateMentor(createdMentor.id, 'admin_1');
    const deactivatedMentor = await db.getMentorById(createdMentor.id);
    console.log('Deactivated Mentor Status in DB:', deactivatedMentor?.status);

    // Verify Login Blocked when Inactive
    console.log('\n--- 7. Verifying Login BLOCKED for Deactivated Mentor ---');
    try {
      await auth.login({
        email: newMentorEmail,
        password: 'NewPermanentPass123!',
        role: 'mentor',
      });
      throw new Error('Deactivated mentor login should have been blocked!');
    } catch (err: any) {
      console.log('PASSED: Login blocked with error:', err.message);
    }

    // Reactivate Mentor
    console.log('\n--- 8. Reactivating Mentor ---');
    await db.reactivateMentor(createdMentor.id, 'admin_1');
    const reactivatedMentor = await db.getMentorById(createdMentor.id);
    console.log('Reactivated Mentor Status in DB:', reactivatedMentor?.status);

    // Verify Login Succeeds after Reactivation with Permanent Password
    console.log('\n--- 9. Verifying Login SUCCEEDS after Reactivation ---');
    const reactivatedUser = await auth.login({
      email: newMentorEmail,
      password: 'NewPermanentPass123!',
      role: 'mentor',
    });
    console.log('PASSED: Reactivated mentor login succeeded!');
    await auth.logout();

    // PART 8: DELETE MENTOR
    console.log('\n--- 10. Deleting Mentor ---');
    await db.deleteMentor(createdMentor.id, 'admin_1');
    const deletedMentor = await db.getMentorById(createdMentor.id);
    console.log('Deleted Mentor Lookup in DB:', deletedMentor);

    if (deletedMentor !== null) {
      throw new Error('Expected deleted mentor to be null.');
    }
    console.log('PASSED: Mentor deleted from active records!');

  } catch (err: any) {
    console.error('ADMIN MENTOR MANAGEMENT TEST FAILED:', err.message);
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log(' SUCCESS: ALL ADMIN MENTOR MANAGEMENT TESTS PASSED!');
  console.log('====================================================');
}

testAdminMentorManagement();
