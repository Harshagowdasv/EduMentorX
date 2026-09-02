// @ts-ignore
import { adminAuth, adminDb } from '../server/firebaseAdmin.js';
import { FirebaseDatabaseService } from './services/firebase/FirebaseDatabaseService';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import http from 'http';

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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function makeHttpRequest(urlStr: string, options: http.RequestOptions, bodyData: any): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const postData = JSON.stringify(bodyData);
    const reqOpts: http.RequestOptions = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...options.headers,
      },
      timeout: 120000,
    };

    const req = http.request(reqOpts, (res) => {
      let chunks = '';
      res.on('data', (c) => (chunks += c));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(chunks);
          resolve({ status: res.statusCode || 500, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode || 500, data: { raw: chunks } });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('HTTP request timed out after 120s'));
    });

    req.write(postData);
    req.end();
  });
}

async function runInvestigationTests() {
  console.log('====================================================');
  console.log(' EDUMENTORX AI MENTOR INVESTIGATION TEST SUITE');
  console.log(' Target Project ID: edumentorx-ab2e1');
  console.log('====================================================');

  const fbDb = new FirebaseDatabaseService();

  const studentRow = {
    usn: 'INV-STU-777',
    name: 'Investigation Test Student',
    email: 'investigate_student@test.com',
    phone: '9000000077',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: 'Semester 6',
    section: 'A',
    cgpa: 8.2,
    attendance: 82,
  };

  async function cleanupEmail(email: string) {
    try {
      const u = await adminAuth.getUserByEmail(email);
      if (u) await adminAuth.deleteUser(u.uid);
    } catch {}
  }

  // 1. Cleanup old test account
  await cleanupEmail(studentRow.email);

  // 2. Create student account
  console.log('\n--- 1. CREATING TEST STUDENT ACCOUNT ---');
  await fbDb.importStudentsCSV([studentRow], 'admin_test');
  console.log('Student created via CSV import.');

  // 3. Authenticate client and get ID token
  console.log('\n--- 2. AUTHENTICATING CLIENT & FETCHING ID TOKEN ---');
  const userCredential = await signInWithEmailAndPassword(clientAuth, studentRow.email, studentRow.phone);
  const idToken = await userCredential.user.getIdToken();
  console.log(`Authenticated Student UID: ${userCredential.user.uid}`);

  // Helper for sending chat requests
  async function sendChatMessage(testName: string, messageText: string) {
    console.log(`\n--- ${testName.toUpperCase()}: "${messageText}" ---`);
    const { status, data } = await makeHttpRequest(
      'http://localhost:5000/api/ai/chat',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      },
      { message: messageText }
    );

    console.log(`HTTP Status: ${status}`);

    if (status !== 200) {
      throw new Error(`Request failed with status ${status}: ${JSON.stringify(data)}`);
    }

    console.log(`Safety Severity: ${data.safety?.severity}`);
    console.log(`Response Snippet: "${data.text?.substring(0, 160)}..."`);
    return data;
  }

  // Test 1: "Hi"
  await sendChatMessage('Test 1 - Greeting', 'Hi');
  await sleep(1100);

  // Test 2: Academic Question
  await sendChatMessage('Test 2 - Academic Question', 'What is my current CGPA and attendance requirement?');
  await sleep(1100);

  // Test 3: Study-Plan Request
  await sendChatMessage('Test 3 - Study-Plan Request', 'Can you help me build a weekly study schedule?');
  await sleep(1100);

  // Test 4: Normal Exam Stress ("I'm stressed because my exams are coming")
  const dataExamStress = await sendChatMessage('Test 4 - Normal Exam Stress', "I'm stressed because my exams are coming");
  
  if (dataExamStress.safety?.isEscalated) {
    throw new Error('Normal exam stress message was incorrectly flagged as an emergency safety alert!');
  }
  if (dataExamStress.safety?.severity !== 'NORMAL' && dataExamStress.safety?.severity !== 'LOW_CONCERN') {
    throw new Error(`Expected NORMAL or LOW_CONCERN severity, but got ${dataExamStress.safety?.severity}`);
  }

  console.log('\nPASSED: "I\'m stressed because my exams are coming" classified correctly as normal/low concern without emergency escalation.');

  // 4. Cleanup test account
  await signOut(clientAuth);
  await cleanupEmail(studentRow.email);
  console.log('\nCleaned up test account.');

  console.log('\n====================================================');
  console.log(' ALL AI MENTOR INVESTIGATION TESTS PASSED SUCCESSFULLY');
  console.log('====================================================');
  process.exit(0);
}

runInvestigationTests();
