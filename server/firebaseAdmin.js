import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let adminAuth = null;
let adminDb = null;
let isInitialized = false;

try {
  if (!admin.apps || admin.apps.length === 0) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'edumentorx-ab2e1';

    if (serviceAccountJson) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
        projectId,
      });
      isInitialized = true;
    } else if (serviceAccountPath) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        projectId,
      });
      isInitialized = true;
    } else {
      // Default Application Credentials (GCP / Local ADC / Firebase CLI ADC)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId,
      });
      isInitialized = true;
    }
  } else {
    isInitialized = true;
  }

  adminAuth = admin.auth();
  adminDb = admin.firestore();
} catch (err) {
  console.warn('[Firebase Admin SDK Warning] Initialization failed:', err.message);
  console.warn('Server will fall back to local mode until Firebase Service Account / ADC credentials are configured.');
}

export { admin, adminAuth, adminDb, isInitialized };
