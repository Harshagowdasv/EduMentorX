import dotenv from 'dotenv';
import readline from 'readline';
import { createInitialAdminAccount, checkAdminStatus } from '../server/initAdminService.js';

dotenv.config();

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function runCli() {
  console.log('====================================================');
  console.log(' EduMentorX — One-Time Initial Admin Account CLI ');
  console.log('====================================================');

  try {
    const status = await checkAdminStatus();

    if (!status.isInitialized || status.error) {
      console.error('\n[INITIALIZATION ERROR]:', status.error || 'Firebase Admin SDK is not initialized.');
      console.error('\nTroubleshooting:');
      console.error('  1. Download your service account key from:');
      console.error('     Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key');
      console.error('  2. Set environment variable or save file to server directory:');
      console.error('     PowerShell: $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\service-account.json"');
      console.error('     CMD:        set GOOGLE_APPLICATION_CREDENTIALS=C:\\path\\to\\service-account.json');
      process.exit(1);
    }

    if (status.hasAdmin) {
      console.log('\n[REFUSED]: Initial Administrator account already exists!');
      console.log(`Admin email: ${status.adminEmail}`);
      console.log('The initialization mechanism is locked and will not create duplicate admins.');
      process.exit(0);
    }

    let password = process.env.INITIAL_ADMIN_PASSWORD || process.argv[2]?.replace('--password=', '');

    if (!password) {
      password = await prompt('\nEnter secure initial password for admin@edumentorx.edu (min 8 chars): ');
    }

    if (!password || password.trim().length < 8) {
      console.error('\n[ERROR]: Password must be at least 8 characters long.');
      process.exit(1);
    }

    console.log('\nInitializing initial admin account in Firebase Authentication & Firestore...');
    const result = await createInitialAdminAccount(password.trim());

    if (result.success) {
      console.log('\n====================================================');
      console.log(' SUCCESS: INITIAL ADMIN ACCOUNT CREATED SUCCESSFULLY');
      console.log('====================================================');
      console.log(` User ID:     ${result.uid}`);
      console.log(` Name:        ${result.name}`);
      console.log(` Email:       ${result.email}`);
      console.log(` Role:        admin (Custom Claim: role="admin", admin=true)`);
      console.log(` Created At:  ${result.createdAt}`);
      console.log(` Flag:        mustChangePassword = true`);
      console.log('----------------------------------------------------');
      console.log(' You can now log into the EduMentorX Admin Portal at:');
      console.log(' https://edumentorx-ab2e1.web.app or local dev server.');
      console.log('====================================================\n');
    } else {
      console.error('\n[REFUSED]:', result.message);
    }
  } catch (err) {
    console.error('\n[INITIALIZATION ERROR]:', err.message);
    process.exit(1);
  }
}

runCli();
