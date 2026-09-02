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

async function testGeminiFix() {
  console.log('====================================================');
  console.log(' TESTING POST /api/ai/chat WITH AUTHENTICATED STUDENT');
  console.log('====================================================');

  const fbDb = new FirebaseDatabaseService();

  const studentRow = {
    usn: 'GEM-STU-901',
    name: 'Gemini Fix Student',
    email: 'gemini_fix_student@test.com',
    phone: '9000000099',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'A',
    cgpa: 8.5,
    attendance: 88,
  };

  async function cleanupEmail(email: string) {
    try {
      const u = await adminAuth.getUserByEmail(email);
      if (u) await adminAuth.deleteUser(u.uid);
    } catch {}
  }

  // 1. Cleanup old test student
  await cleanupEmail(studentRow.email);

  // 2. Create student account
  console.log('\n--- 1. CREATING TEST STUDENT ACCOUNT ---');
  await fbDb.importStudentsCSV([studentRow], 'admin_test');
  console.log('Student created via CSV import.');

  // 3. Authenticate client and get ID token
  console.log('\n--- 2. AUTHENTICATING CLIENT & FETCHING ID TOKEN ---');
  const userCredential = await signInWithEmailAndPassword(clientAuth, studentRow.email, studentRow.phone);
  const idToken = await userCredential.user.getIdToken();
  console.log('Authenticated successfully. ID Token obtained.');

  // 4. Send "Hi" to POST /api/ai/chat
  console.log('\n--- 3. SENDING "Hi" TO POST /api/ai/chat ---');
  const res = await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ message: 'Hi' }),
  });

  console.log(`HTTP Status Code: ${res.status}`);
  const data = await res.json();
  console.log('Response JSON:', JSON.stringify(data, null, 2));

  if (res.status !== 200) {
    throw new Error(`Endpoint returned status ${res.status}: ${JSON.stringify(data)}`);
  }

  if (!data.text) {
    throw new Error('Response text is missing from AI response!');
  }

  console.log('\nSUCCESS! Real Gemini AI Response Received:');
  console.log('----------------------------------------------------');
  console.log(data.text);
  console.log('----------------------------------------------------');

  // 5. Cleanup test account
  await signOut(clientAuth);
  await cleanupEmail(studentRow.email);
  console.log('Cleaned up test account.');

  console.log('\n====================================================');
  console.log(' GEMINI MODEL COMPATIBILITY FIX VERIFIED SUCCESSFULLY');
  console.log('====================================================');
  process.exit(0);
}

testGeminiFix();
