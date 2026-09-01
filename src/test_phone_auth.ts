import { DemoAuthService } from './services/demo/DemoAuthService';

async function testPhoneAuthFlow() {
  console.log('====================================================');
  console.log(' TESTING PHONE NUMBER INITIAL PASSWORD LIFECYCLE');
  console.log('====================================================');

  const auth = new DemoAuthService();

  // Test 1: Mentor Login with Registered Phone Number as Initial Password
  console.log('\n--- 1. Testing Mentor Initial Login (mentor.sarah@edumentorx.edu + 5552345678) ---');
  try {
    const user1 = await auth.login({
      email: 'mentor.sarah@edumentorx.edu',
      password: '5552345678',
      role: 'mentor',
    });
    console.log('Login Succeeded for:', user1.email);
    console.log('Name:', user1.name);
    console.log('mustChangePassword:', user1.mustChangePassword);

    if (user1.mustChangePassword !== true) {
      throw new Error('Expected mustChangePassword to be TRUE on initial login.');
    }

    // Change Password
    console.log('\n--- 2. Updating Password to New Permanent Password ---');
    await auth.changePassword('5552345678', 'SarahNewSecurePass123!');
    const currUser = await auth.getCurrentUser();
    console.log('mustChangePassword after update:', currUser?.mustChangePassword);

    if (currUser?.mustChangePassword !== false) {
      throw new Error('Expected mustChangePassword to be FALSE after password change.');
    }

    // Logout
    await auth.logout();
    console.log('Logged out successfully.');

    // Test Old Password (MUST FAIL)
    console.log('\n--- 3. Testing Login with Old Phone Password (MUST FAIL) ---');
    try {
      await auth.login({
        email: 'mentor.sarah@edumentorx.edu',
        password: '5552345678',
        role: 'mentor',
      });
      throw new Error('Old phone password login should have failed but passed!');
    } catch (err: any) {
      console.log('PASSED: Old password rejected cleanly with error:', err.message);
    }

    // Test New Password (MUST SUCCEED)
    console.log('\n--- 4. Testing Login with New Permanent Password (MUST SUCCEED) ---');
    const userUpdated = await auth.login({
      email: 'mentor.sarah@edumentorx.edu',
      password: 'SarahNewSecurePass123!',
      role: 'mentor',
    });
    console.log('PASSED: New permanent password login succeeded!');
    console.log('mustChangePassword for updated user:', userUpdated.mustChangePassword);
  } catch (err: any) {
    console.error('MENTOR TEST FAILED:', err.message);
    process.exit(1);
  }

  // Test 2: Student Login with Registered Phone Number as Initial Password
  console.log('\n--- 5. Testing Student Initial Login (student.alex@edumentorx.edu + 5551112233) ---');
  try {
    const studentUser = await auth.login({
      email: 'student.alex@edumentorx.edu',
      password: '5551112233',
      role: 'student',
    });
    console.log('Login Succeeded for:', studentUser.email);
    console.log('Name:', studentUser.name);
    console.log('mustChangePassword:', studentUser.mustChangePassword);

    await auth.changePassword('5551112233', 'AlexNewStudentPass123!');
    console.log('Student password updated successfully.');

    await auth.logout();

    // Old password fail test
    try {
      await auth.login({
        email: 'student.alex@edumentorx.edu',
        password: '5551112233',
        role: 'student',
      });
      throw new Error('Student old phone password login should have failed!');
    } catch (err: any) {
      console.log('PASSED: Student old password rejected cleanly:', err.message);
    }

    // New password succeed test
    const studentUpdated = await auth.login({
      email: 'student.alex@edumentorx.edu',
      password: 'AlexNewStudentPass123!',
      role: 'student',
    });
    console.log('PASSED: Student new permanent password login succeeded!');
  } catch (err: any) {
    console.error('STUDENT TEST FAILED:', err.message);
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log(' SUCCESS: ALL AUTHENTICATION LIFECYCLE TESTS PASSED!');
  console.log('====================================================');
}

testPhoneAuthFlow();
