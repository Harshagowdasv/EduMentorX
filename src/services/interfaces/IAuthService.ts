import { User, UserRole } from '../../types';

export interface LoginCredentials {
  email: string;
  password?: string;
  role: UserRole;
}

export interface IAuthService {
  getCurrentUser(): Promise<User | null>;
  login(credentials: LoginCredentials): Promise<User>;
  logout(): Promise<void>;
  changePassword(oldPassword: string, newPassword: string): Promise<boolean>;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
