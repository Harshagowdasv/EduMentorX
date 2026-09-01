import { adminAuth, adminDb, isInitialized } from './firebaseAdmin.js';

// 1. Create Mentor / User Auth Account
export async function createMentorAuthAccount({ name, email, phone, department, staffId, actorId }) {
  if (!isInitialized || !adminAuth || !adminDb) {
    throw new Error('Firebase Admin SDK is not initialized on backend server.');
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').trim();
  const phoneDigits = cleanPhone.replace(/\D/g, '');

  if (!cleanEmail) {
    throw new Error('Enter a valid email address.');
  }

  if (!cleanPhone || phoneDigits.length === 0) {
    throw new Error('Phone number is required because it is used as the initial password.');
  }

  // Use exact raw phone digits as initial password (e.g. "9000000003")
  const initialPassword = phoneDigits;

  if (initialPassword.length < 6) {
    throw new Error('Phone number must contain at least 6 digits for use as temporary password.');
  }

  // Check if user already exists in Firebase Auth
  let existingUser = null;
  try {
    existingUser = await adminAuth.getUserByEmail(cleanEmail);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      throw err;
    }
  }

  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  // Create Firebase Auth User
  const userRecord = await adminAuth.createUser({
    email: cleanEmail,
    displayName: (name || '').trim(),
    password: initialPassword,
    emailVerified: true,
    disabled: false,
  });

  // Assign Custom Claim
  await adminAuth.setCustomUserClaims(userRecord.uid, {
    role: 'mentor',
    mentor: true,
  });

  const now = new Date().toISOString();
  const mentorId = `m_${Date.now()}`;

  const mentorData = {
    id: mentorId,
    userId: userRecord.uid,
    name: (name || '').trim(),
    email: cleanEmail,
    phone: cleanPhone,
    department: (department || 'Computer Science & Engineering').trim(),
    staffId: (staffId || '').trim(),
    activeMenteesCount: 0,
    status: 'active',
    createdAt: now,
  };

  // Write Firestore documents (guarded in case Firestore DB default is not provisioned)
  try {
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      id: userRecord.uid,
      name: (name || '').trim(),
      email: cleanEmail,
      phone: cleanPhone,
      role: 'mentor',
      department: (department || 'Computer Science & Engineering').trim(),
      status: 'active',
      createdAt: now,
      mustChangePassword: true,
    });

    await adminDb.collection('mentors').doc(mentorId).set(mentorData);
  } catch (err) {
    console.warn('[Firestore Write Notice]:', err.message);
  }

  // Record Audit Event
  try {
    await adminDb.collection('auditLogs').add({
      id: `log_${Date.now()}`,
      actorId: actorId || 'admin',
      actorName: 'Admin User',
      actorRole: 'admin',
      action: 'CREATE_MENTOR',
      targetType: 'Mentor',
      targetId: mentorId,
      newValue: { name: mentorData.name, email: cleanEmail, department: mentorData.department },
      details: `Created new faculty mentor account for ${mentorData.name}`,
      timestamp: now,
    });
  } catch (err) {
    console.warn('[Audit Log Warning]:', err.message);
  }

  return {
    success: true,
    uid: userRecord.uid,
    mentor: mentorData,
    message: 'Mentor created successfully.',
  };
}

// 2. Deactivate Mentor Account
export async function deactivateMentorAccount({ mentorId, actorId }) {
  if (!isInitialized || !adminAuth || !adminDb) {
    throw new Error('Firebase Admin SDK is not initialized on backend server.');
  }

  const mentorDoc = await adminDb.collection('mentors').doc(mentorId).get();
  if (!mentorDoc.exists) {
    throw new Error('Mentor profile not found.');
  }

  const mentorData = mentorDoc.data();
  const uid = mentorData.userId || mentorId;

  // Disable Firebase Auth Account
  try {
    await adminAuth.updateUser(uid, { disabled: true });
  } catch (err) {
    console.warn('[Firebase Auth Disable Warning]:', err.message);
  }

  const now = new Date().toISOString();

  // Update Firestore status to 'inactive'
  await adminDb.collection('mentors').doc(mentorId).update({
    status: 'inactive',
    updatedAt: now,
  });

  try {
    await adminDb.collection('users').doc(uid).update({
      status: 'inactive',
      updatedAt: now,
    });
  } catch (err) {
    console.warn('[Users Collection Status Update Warning]:', err.message);
  }

  // Audit Log
  try {
    await adminDb.collection('auditLogs').add({
      id: `log_${Date.now()}`,
      actorId: actorId || 'admin',
      actorName: 'Admin User',
      actorRole: 'admin',
      action: 'DEACTIVATE_MENTOR',
      targetType: 'Mentor',
      targetId: mentorId,
      details: `Deactivated mentor ${mentorData.name}. Historical records preserved.`,
      timestamp: now,
    });
  } catch (err) {
    console.warn('[Audit Log Warning]:', err.message);
  }

  return {
    success: true,
    mentorId,
    status: 'inactive',
    message: `Mentor ${mentorData.name} deactivated successfully.`,
  };
}

// 3. Reactivate Mentor Account
export async function reactivateMentorAccount({ mentorId, actorId }) {
  if (!isInitialized || !adminAuth || !adminDb) {
    throw new Error('Firebase Admin SDK is not initialized on backend server.');
  }

  const mentorDoc = await adminDb.collection('mentors').doc(mentorId).get();
  if (!mentorDoc.exists) {
    throw new Error('Mentor profile not found.');
  }

  const mentorData = mentorDoc.data();
  const uid = mentorData.userId || mentorId;

  // Enable Firebase Auth Account
  try {
    await adminAuth.updateUser(uid, { disabled: false });
  } catch (err) {
    console.warn('[Firebase Auth Enable Warning]:', err.message);
  }

  const now = new Date().toISOString();

  // Update Firestore status to 'active'
  await adminDb.collection('mentors').doc(mentorId).update({
    status: 'active',
    updatedAt: now,
  });

  try {
    await adminDb.collection('users').doc(uid).update({
      status: 'active',
      updatedAt: now,
    });
  } catch (err) {
    console.warn('[Users Collection Status Update Warning]:', err.message);
  }

  // Audit Log
  try {
    await adminDb.collection('auditLogs').add({
      id: `log_${Date.now()}`,
      actorId: actorId || 'admin',
      actorName: 'Admin User',
      actorRole: 'admin',
      action: 'REACTIVATE_MENTOR',
      targetType: 'Mentor',
      targetId: mentorId,
      details: `Reactivated mentor ${mentorData.name}.`,
      timestamp: now,
    });
  } catch (err) {
    console.warn('[Audit Log Warning]:', err.message);
  }

  return {
    success: true,
    mentorId,
    status: 'active',
    message: `Mentor ${mentorData.name} reactivated successfully.`,
  };
}

// 4. Delete Mentor Account
export async function deleteMentorAccount({ mentorId, actorId }) {
  if (!isInitialized || !adminAuth || !adminDb) {
    throw new Error('Firebase Admin SDK is not initialized on backend server.');
  }

  const mentorDoc = await adminDb.collection('mentors').doc(mentorId).get();
  if (!mentorDoc.exists) {
    throw new Error('Mentor profile not found.');
  }

  const mentorData = mentorDoc.data();
  const uid = mentorData.userId || mentorId;

  // Check active mentees
  if (mentorData.activeMenteesCount > 0) {
    throw new Error('This mentor currently has allocated students. Reassign students before permanently deleting this mentor.');
  }

  const allocSnap = await adminDb
    .collection('mentorAllocations')
    .where('mentorId', '==', mentorId)
    .where('status', '==', 'ACTIVE')
    .get();

  if (!allocSnap.empty) {
    throw new Error('This mentor currently has allocated students. Reassign students before permanently deleting this mentor.');
  }

  // Delete Firebase Auth User
  try {
    await adminAuth.deleteUser(uid);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      console.warn('[Firebase Auth Delete Warning]:', err.message);
    }
  }

  // Delete Mentor Document from Firestore
  await adminDb.collection('mentors').doc(mentorId).delete();
  try {
    await adminDb.collection('users').doc(uid).delete();
  } catch (err) {
    console.warn('[User Doc Delete Warning]:', err.message);
  }

  const now = new Date().toISOString();

  // Audit Log (preserving history)
  try {
    await adminDb.collection('auditLogs').add({
      id: `log_${Date.now()}`,
      actorId: actorId || 'admin',
      actorName: 'Admin User',
      actorRole: 'admin',
      action: 'DELETE_MENTOR',
      targetType: 'Mentor',
      targetId: mentorId,
      details: `Deleted mentor ${mentorData.name}. Mentees reassigned, historical records preserved.`,
      timestamp: now,
    });
  } catch (err) {
    console.warn('[Audit Log Warning]:', err.message);
  }

  return {
    success: true,
    mentorId,
    message: `Mentor ${mentorData.name} deleted successfully.`,
  };
}

// 5. Generic Student / Auth Creation with Phone Password
export async function createAuthAccountWithPhonePassword({ email, phone, role, name, department }) {
  if (!isInitialized || !adminAuth || !adminDb) {
    return { success: false, reason: 'ADMIN_SDK_NOT_INITIALIZED' };
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').trim();
  const phoneDigits = cleanPhone.replace(/\D/g, '') || '9000000000';

  if (!cleanEmail) {
    throw new Error('Email is required for Auth account creation.');
  }

  let userRecord;
  let isNewAuth = false;
  try {
    userRecord = await adminAuth.getUserByEmail(cleanEmail);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      userRecord = await adminAuth.createUser({
        email: cleanEmail,
        displayName: name || cleanEmail.split('@')[0],
        password: phoneDigits,
        emailVerified: true,
      });
      isNewAuth = true;
    } else {
      throw err;
    }
  }

  await adminAuth.setCustomUserClaims(userRecord.uid, {
    role,
    [role]: true,
  });

  const now = new Date().toISOString();

  try {
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      id: userRecord.uid,
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      phone: cleanPhone,
      role,
      department: department || 'General',
      status: 'active',
      createdAt: now,
      mustChangePassword: true,
    }, { merge: true });
  } catch (err) {
    console.warn('[Firestore Profile Notice]:', err.message);
  }

  return {
    success: true,
    uid: userRecord.uid,
    isNewAuth,
    email: cleanEmail,
    role,
    mustChangePassword: true,
  };
}
