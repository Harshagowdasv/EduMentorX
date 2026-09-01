import { adminAuth, adminDb, isInitialized } from './firebaseAdmin.js';

const ADMIN_EMAIL = 'admin@edumentorx.edu';
const ADMIN_NAME = 'EduMentorX Admin';

export async function createInitialAdminAccount(initialPassword) {
  if (!isInitialized || !adminAuth || !adminDb) {
    throw new Error(
      'Firebase Admin SDK is not initialized. Please ensure GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_KEY is configured.'
    );
  }

  // 1. Check if admin user already exists in Firebase Auth
  let existingAuthUser = null;
  try {
    existingAuthUser = await adminAuth.getUserByEmail(ADMIN_EMAIL);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      throw err;
    }
  }

  // 2. Check if admin user profile exists in Firestore /users collection
  const existingAdminQuery = await adminDb
    .collection('users')
    .where('role', '==', 'admin')
    .get();

  // Refuse initialization if admin already exists
  if (existingAuthUser || !existingAdminQuery.empty) {
    return {
      success: false,
      code: 'ADMIN_ALREADY_EXISTS',
      message: 'Initial Administrator account already exists in Firebase. Refusing duplicate creation.',
      existingUid: existingAuthUser ? existingAuthUser.uid : (existingAdminQuery.docs[0]?.id || null),
    };
  }

  // Validate initial password
  if (!initialPassword || typeof initialPassword !== 'string' || initialPassword.length < 8) {
    throw new Error('Initial admin password must be at least 8 characters long.');
  }

  // 3. Create Firebase Auth user securely
  const userRecord = await adminAuth.createUser({
    email: ADMIN_EMAIL,
    displayName: ADMIN_NAME,
    password: initialPassword,
    emailVerified: true,
  });

  // 4. Assign trusted server-side custom claims (admin: true, role: 'admin')
  await adminAuth.setCustomUserClaims(userRecord.uid, {
    role: 'admin',
    admin: true,
  });

  const now = new Date().toISOString();

  // 5. Create user profile document in Firestore /users/{uid}
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

  // 6. Record initial creation audit log
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

  return {
    success: true,
    uid: userRecord.uid,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    role: 'admin',
    createdAt: now,
    message: `Initial Administrator account successfully created for ${ADMIN_EMAIL}.`,
  };
}

export async function checkAdminStatus() {
  if (!isInitialized || !adminAuth || !adminDb) {
    return { isInitialized: false, hasAdmin: false };
  }

  let hasAuthAdmin = false;
  try {
    const user = await adminAuth.getUserByEmail(ADMIN_EMAIL);
    if (user) hasAuthAdmin = true;
  } catch {
    hasAuthAdmin = false;
  }

  const snapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
  const hasFirestoreAdmin = !snapshot.empty;

  return {
    isInitialized: true,
    hasAdmin: hasAuthAdmin || hasFirestoreAdmin,
    adminEmail: (hasAuthAdmin || hasFirestoreAdmin) ? ADMIN_EMAIL : null,
  };
}
