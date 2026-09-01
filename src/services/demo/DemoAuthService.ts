import { IAuthService, LoginCredentials } from '../interfaces/IAuthService';
import { User, UserRole, Mentor, Student } from '../../types';
import { dbService } from '../serviceFactory';
import { initialMentors, initialStudents } from '../seedData';

const STORAGE_KEY_USER = 'edumentorx_current_user';

export class DemoAuthService implements IAuthService {
  private listeners: ((user: User | null) => void)[] = [];
  private currentUser: User | null = null;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch {
        this.currentUser = null;
      }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async login(credentials: LoginCredentials): Promise<User> {
    const { email, password, role } = credentials;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    let user: User;

    if (role === 'admin') {
      user = {
        id: 'admin_1',
        email: cleanEmail || 'admin@edumentorx.edu',
        name: 'System Administrator',
        role: 'admin',
        department: 'Institutional Administration',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      };
    } else if (role === 'mentor') {
      let mentorList: Mentor[] = [];
      try {
        mentorList = await dbService.getMentors();
      } catch {
        mentorList = initialMentors;
      }
      if (!mentorList || mentorList.length === 0) {
        mentorList = initialMentors;
      }

      // Lookup mentor by normalized email
      let matchedMentor = mentorList.find(
        (m) => m.email.trim().toLowerCase() === cleanEmail
      );

      // Fallback search if partial match or default quick demo click
      if (!matchedMentor && !cleanEmail) {
        matchedMentor = mentorList[0];
      }

      if (!matchedMentor) {
        // Fallback check against initial mentors seed list
        matchedMentor = initialMentors.find(
          (m) => m.email.trim().toLowerCase() === cleanEmail
        );
      }

      if (!matchedMentor) {
        throw new Error(`No mentor account found matching email '${email}'. Please verify your credentials.`);
      }

      // Password verification logic
      if (cleanPassword && cleanPassword !== 'password123' && cleanPassword !== 'demo_password') {
        const phoneDigits = (matchedMentor.phone || '').replace(/\D/g, '');
        const passDigits = cleanPassword.replace(/\D/g, '');
        const matchesPhone =
          cleanPassword === matchedMentor.phone ||
          (phoneDigits.length > 0 && (passDigits === phoneDigits || phoneDigits.endsWith(passDigits)));

        if (!matchesPhone && cleanPassword !== 'admin123') {
          throw new Error(`Invalid password for mentor account '${matchedMentor.email}'. Initial password is phone number: ${matchedMentor.phone}`);
        }
      }

      user = {
        id: matchedMentor.id, // Canonical Mentor ID (e.g. 'm1', 'm2', 'm3', 'm4', 'm5', 'm_...')
        email: matchedMentor.email,
        name: matchedMentor.name,
        role: 'mentor',
        department: matchedMentor.department,
        phone: matchedMentor.phone,
        avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=250',
      };
    } else {
      // Student Role
      let studentList: Student[] = [];
      try {
        const res = await dbService.getStudents(1, 1000);
        studentList = res.students;
      } catch {
        studentList = initialStudents;
      }

      let matchedStudent = studentList.find(
        (s) => s.email.trim().toLowerCase() === cleanEmail || s.usn.trim().toLowerCase() === cleanEmail
      );

      if (!matchedStudent) {
        matchedStudent = initialStudents.find(
          (s) => s.email.trim().toLowerCase() === cleanEmail
        ) || initialStudents[0];
      }

      user = {
        id: matchedStudent ? matchedStudent.id : 's1',
        email: matchedStudent ? matchedStudent.email : (cleanEmail || 'student.alex@edumentorx.edu'),
        name: matchedStudent ? matchedStudent.name : 'Alex Rivera',
        role: 'student',
        department: matchedStudent ? matchedStudent.department : 'Computer Science & Engineering',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
      };
    }

    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    this.notifyListeners();
    return user;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY_USER);
    this.notifyListeners();
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    if (this.currentUser) {
      this.currentUser.mustChangePassword = false;
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
      this.notifyListeners();
    }
    return true;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.currentUser));
  }
}
