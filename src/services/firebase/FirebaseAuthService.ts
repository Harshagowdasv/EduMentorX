import { IAuthService, LoginCredentials } from '../interfaces/IAuthService';
import { User, UserRole } from '../../types';
import { auth, db, isFirebaseConfigured } from './firebaseConfig';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged as firebaseOnAuthChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
    const res = await signInWithEmailAndPassword(auth, credentials.email, credentials.password || 'password123');
    return this.buildUserFromFbUser(res.user, credentials.role);
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
      mustChangePassword,
    };
  }
}
