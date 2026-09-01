import { adminAuth, adminDb, isInitialized, credentialError, projectId } from './firebaseAdmin.js';

const ADMIN_EMAIL = 'admin@edumentorx.edu';
const ADMIN_NAME = 'EduMentorX Admin';

export async function createInitialAdminAccount(initialPassword) {
  if (!isInitialized || !adminAuth || !adminDb) {
    throw new Error(
      `Firebase Admin SDK is not initialized for project [${projectId}].\nReason: ${credentialError || 'Missing or invalid service account credentials.'}`
    );
  }

  const now = new Date().toISOString();

  // 1. Check if admin user already exists in Firebase Auth
  let userRecord = null;
  try {
    userRecord = await adminAuth.getUserByEmail(ADMIN_EMAIL);
    console.log(`[Auth Status]: User ${ADMIN_EMAIL} already exists in Firebase Authentication (UID: ${userRecord.uid}).`);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      throw err;
    }
  }

  // 2. Check if admin user profile exists in Firestore /users collection
  let existingFirestoreDocExists = false;
  try {
    const snap = await adminDb.collection('users').where('role', '==', 'admin').get();
    existingFirestoreDocExists = !snap.empty;
  } catch (err) {
    if (err.message && err.message.includes('NOT_FOUND')) {
      console.warn('\n[FIRESTORE DATABASE NOTICE]:');
      console.warn(`  Cloud Firestore database (default) has NOT been created yet in Firebase Console for project [${projectId}].`);
      console.warn(`  Please go to Firebase Console -> Build -> Firestore Database -> Click "Create database".\n`);
    } else {
      console.warn('[Firestore Lookup Notice]:', err.message);
    }
  }

  // Refuse duplicate creation if both Auth and Firestore profiles are fully present
  if (userRecord && existingFirestoreDocExists) {
    return {
      success: false,
      code: 'ADMIN_ALREADY_EXISTS',
      message: `Initial Administrator account already exists in Firebase (UID: ${userRecord.uid}). Refusing duplicate creation.`,
      existingUid: userRecord.uid,
    };
  }

  // 3. Create Firebase Auth user if not present
  if (!userRecord) {
    if (!initialPassword || typeof initialPassword !== 'string' || initialPassword.length < 8) {
      throw new Error('Initial admin password must be at least 8 characters long.');
    }

    userRecord = await adminAuth.createUser({
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      password: initialPassword,
      emailVerified: true,
    });
    console.log(`[Auth Success]: Created Auth user ${ADMIN_EMAIL} with UID: ${userRecord.uid}`);
  }

  // 4. Assign trusted server-side custom claims (admin: true, role: 'admin')
  await adminAuth.setCustomUserClaims(userRecord.uid, {
    role: 'admin',
    admin: true,
  });
  console.log(`[Custom Claims Success]: Assigned { role: "admin", admin: true } to UID: ${userRecord.uid}`);

  // 5. Attempt to create user profile document in Firestore /users/{uid}
  let firestoreCreated = false;
  try {
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      id: userRecord.uid,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: 'admin',
      department: 'Institutional Administration',
      createdAt: now,
      mustChangePassword: true,
    });
    firestoreCreated = true;

    await adminDb.collection('auditLogs').add({
      id: `log_${Date.now()}`,
      actorId: userRecord.uid,
      actorName: ADMIN_NAME,
      actorRole: 'admin',
      action: 'CREATE_INITIAL_ADMIN',
      targetType: 'User',
      targetId: userRecord.uid,
      details: 'Initial Administrator account initialized securely via server-side Admin SDK',
      timestamp: now,
    });
  } catch (err) {
    if (err.message && err.message.includes('NOT_FOUND')) {
      console.warn('\n========================================================================');
      console.warn(' NOTICE: FIRESTORE DATABASE NOT CREATED YET IN FIREBASE CONSOLE');
      console.warn('========================================================================');
      console.warn(` Firebase Auth user ${ADMIN_EMAIL} was successfully created & custom claims set!`);
      console.warn(` However, Firestore database (default) is not provisioned in project [${projectId}].`);
      console.warn(' To finish setting up Firestore profile:');
      console.warn(' 1. Go to Firebase Console -> Build -> Firestore Database');
      console.log(' 2. Click "Create database" and choose your region (e.g. us-central1 / asia-south1)');
      console.warn(' 3. Re-run `npm run init-admin` to sync the Firestore user profile.');
      console.warn('========================================================================\n');
    } else {
      console.warn('[Firestore Profile Warning]:', err.message);
    }
  }

  return {
    success: true,
    uid: userRecord.uid,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    role: 'admin',
    createdAt: now,
    firestoreCreated,
    message: firestoreCreated
      ? `Initial Administrator account successfully created in Auth & Firestore for ${ADMIN_EMAIL}.`
      : `Initial Administrator account successfully created in Auth with custom claims for ${ADMIN_EMAIL}. (Firestore database creation in Firebase Console required for profile sync).`,
  };
}

export async function checkAdminStatus() {
  if (!isInitialized || !adminAuth || !adminDb) {
    return {
      isInitialized: false,
      hasAdmin: false,
      error: credentialError || 'Firebase Admin SDK is not initialized.',
    };
  }

  let hasAuthAdmin = false;
  let authUid = null;
  try {
    const user = await adminAuth.getUserByEmail(ADMIN_EMAIL);
    if (user) {
      hasAuthAdmin = true;
      authUid = user.uid;
    }
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      return { isInitialized: false, hasAdmin: false, error: err.message };
    }
  }

  let hasFirestoreAdmin = false;
  try {
    const snapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
    hasFirestoreAdmin = !snapshot.empty;
  } catch (err) {
    if (err.message && !err.message.includes('NOT_FOUND')) {
      console.warn('[Firestore Admin Query Warning]:', err.message);
    }
  }

  return {
    isInitialized: true,
    hasAdmin: hasAuthAdmin && hasFirestoreAdmin,
    hasAuthOnly: hasAuthAdmin && !hasFirestoreAdmin,
    adminEmail: (hasAuthAdmin || hasFirestoreAdmin) ? ADMIN_EMAIL : null,
    authUid,
  };
}
