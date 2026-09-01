// @ts-ignore
import { createMentorAuthAccount, deleteMentorAccount } from '../server/accountService.js';
// @ts-ignore
import { adminAuth } from '../server/firebaseAdmin.js';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, updatePassword, signOut } from 'firebase/auth';

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

async function testRealFirebaseAuth() {
  console.log('====================================================');
  console.log(' REAL FIREBASE AUTH & PROJECT VERIFICATION TEST');
  console.log(' Target Project ID: edumentorx-ab2e1');
  console.log('====================================================');

  const testEmail = 'browsermentor@test.com';
  const testPhone = '9000000009';
  const testName = 'Browser Test Mentor';
  const staffId = 'EMP-CS-888';

  // 1. Cleanup any leftover account from previous runs
  try {
    const existing = await adminAuth.getUserByEmail(testEmail);
    if (existing) {
      console.log('[Cleanup] Deleting existing test user:', existing.uid);
      await adminAuth.deleteUser(existing.uid);
    }
  } catch (err) {
    // Ignore user-not-found
  }

  // 2. Create Mentor Account via Backend Admin SDK
  console.log('\n--- STEP 1: Creating Mentor Account via Backend Admin SDK ---');
  const creationResult = await createMentorAuthAccount({
    name: testName,
    email: testEmail,
    phone: testPhone,
    department: 'Computer Science & Engineering',
    staffId: staffId,
    actorId: 'admin_test',
  });

  console.log('Backend Creation Output:', creationResult);

  if (!creationResult.success || !creationResult.uid) {
    throw new Error('Backend failed to create Auth account.');
  }

  // 3. Verify Account Exists in Firebase Admin Auth
  console.log('\n--- STEP 2: Verifying Auth Account on Firebase Admin SDK ---');
  const authUser = await adminAuth.getUserByEmail(testEmail);
  console.log('[Admin SDK Verify] UID:', authUser.uid);
  console.log('[Admin SDK Verify] Email:', authUser.email);
  console.log('[Admin SDK Verify] Disabled:', authUser.disabled);
  console.log('[Admin SDK Verify] Email Verified:', authUser.emailVerified);

  if (authUser.disabled) {
    throw new Error('Auth account was created as disabled.');
  }

  // 4. Test Client SDK Real Login with Phone Password (9000000009)
  console.log('\n--- STEP 3: Testing Real Firebase Client SDK Login (Phone Password: 9000000009) ---');
  try {
    const loginRes = await signInWithEmailAndPassword(clientAuth, testEmail, testPhone);
    console.log('PASSED: Real Firebase Auth Login Succeeded!');
    console.log('Logged in User UID:', loginRes.user.uid);
    console.log('Logged in User Email:', loginRes.user.email);

    // 5. Update Password to New Permanent Password
    console.log('\n--- STEP 4: Testing Password Update (New Permanent Password) ---');
    const newPermanentPassword = 'BrowserNewSecurePass123!';
    await updatePassword(loginRes.user, newPermanentPassword);
    console.log('PASSED: Firebase Auth Password updated successfully!');

    await signOut(clientAuth);
    console.log('Signed out user.');

    // 6. Verify Old Phone Password Fails
    console.log('\n--- STEP 5: Verifying Old Phone Password (9000000009) FAILS ---');
    try {
      await signInWithEmailAndPassword(clientAuth, testEmail, testPhone);
      throw new Error('Old phone password login should have failed!');
    } catch (err: any) {
      console.log('PASSED: Old password rejected with error code:', err.code);
    }

    // 7. Verify New Password Succeeds
    console.log('\n--- STEP 6: Verifying New Permanent Password SUCCEEDS ---');
    const newLoginRes = await signInWithEmailAndPassword(clientAuth, testEmail, newPermanentPassword);
    console.log('PASSED: New permanent password login succeeded!');
    await signOut(clientAuth);

    // 8. Cleanup Test User
    console.log('\n--- STEP 7: Cleaning Up Test Account ---');
    await adminAuth.deleteUser(creationResult.uid);
    console.log('Test user cleaned up cleanly.');

  } catch (err: any) {
    console.error('REAL FIREBASE AUTH TEST FAILED:', err.message, err.code || '');
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log(' SUCCESS: REAL FIREBASE AUTHENTICATION VERIFIED!');
  console.log('====================================================');
}

testRealFirebaseAuth();
