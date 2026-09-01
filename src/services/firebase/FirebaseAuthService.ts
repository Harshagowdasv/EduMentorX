import { IAuthService, LoginCredentials } from '../interfaces/IAuthService';
import { User, UserRole } from '../../types';
import { auth, db, isFirebaseConfigured } from './firebaseConfig';
import { updatePassword, signInWithEmailAndPassword, signOut, onAuthStateChanged as firebaseOnAuthChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { DemoAuthService } from '../demo/DemoAuthService';

export class FirebaseAuthService implements IAuthService {
  private fallback: DemoAuthService;

  constructor() {
    this.fallback = new DemoAuthService();
  }

  async getCurrentUser(): Promise<User | null> {
    if (!isFirebaseConfigured || !auth) {
      return this.fallback.getCurrentUser();
    }
    const current = auth.currentUser;
    if (!current) return null;

    return this.buildUserFromFbUser(current);
  }

  async login(credentials: LoginCredentials): Promise<User> {
    if (!isFirebaseConfigured || !auth) {
      return this.fallback.login(credentials);
    }

    const cleanEmail = (credentials.email || '').trim().toLowerCase();
    const rawPassword = (credentials.password || '').trim();
    const phoneDigits = rawPassword.replace(/\D/g, '');

    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, rawPassword);
      return this.buildUserFromFbUser(res.user, credentials.role);
    } catch (primaryErr: any) {
      if (
        (primaryErr.code === 'auth/invalid-credential' || primaryErr.code === 'auth/wrong-password') &&
        phoneDigits.length >= 6 &&
        phoneDigits !== rawPassword
      ) {
        try {
          const resFallback = await signInWithEmailAndPassword(auth, cleanEmail, phoneDigits);
          return this.buildUserFromFbUser(resFallback.user, credentials.role);
        } catch {
          // Keep primary error
        }
      }
      throw primaryErr;
    }
  }

  async logout(): Promise<void> {
    if (!isFirebaseConfigured || !auth) {
      return this.fallback.logout();
    }
    await signOut(auth);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    if (!isFirebaseConfigured || !auth) {
      return this.fallback.changePassword(oldPassword, newPassword);
    }

    const current = auth.currentUser;
    if (!current) throw new Error('No authenticated user found.');

    // 1. Update Firebase Auth Password securely
    await updatePassword(current, newPassword);

    // 2. Update Firestore /users/{uid} document
    if (db) {
      try {
        await updateDoc(doc(db, 'users', current.uid), {
          mustChangePassword: false,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to update mustChangePassword flag in Firestore:', err);
      }
    }

    return true;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (!isFirebaseConfigured || !auth) {
      return this.fallback.onAuthStateChanged(callback);
    }
    return firebaseOnAuthChanged(auth, async (fbUser) => {
      if (!fbUser) {
        callback(null);
      } else {
        const u = await this.buildUserFromFbUser(fbUser);
        callback(u);
      }
    });
  }

  private async buildUserFromFbUser(fbUser: any, requestedRole?: UserRole): Promise<User> {
    let role: UserRole = requestedRole || 'student';
    let name = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';
    let department = 'Institutional Administration';
    let mustChangePassword = false;
    let phone = '';

    // 1. Inspect custom claims
    try {
      const tokenResult = await fbUser.getIdTokenResult();
      if (tokenResult.claims.admin || tokenResult.claims.role === 'admin') {
        role = 'admin';
      } else if (tokenResult.claims.role === 'mentor') {
        role = 'mentor';
      } else if (tokenResult.claims.role === 'student') {
        role = 'student';
      }
    } catch (err) {
      console.warn('Failed to read ID token claims:', err);
    }

    // 2. Inspect Firestore /users/{uid} document
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.role) role = data.role as UserRole;
          if (data.name) name = data.name;
          if (data.department) department = data.department;
          if (data.phone) phone = data.phone;
          if (typeof data.mustChangePassword === 'boolean') mustChangePassword = data.mustChangePassword;
        }
      } catch (err) {
        console.warn('Failed to read /users document:', err);
      }
    }

    return {
      id: fbUser.uid,
      email: fbUser.email || '',
      name,
      role,
      department,
      phone,
      mustChangePassword,
    };
  }
}
