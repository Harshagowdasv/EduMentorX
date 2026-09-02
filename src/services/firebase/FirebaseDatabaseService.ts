import { IDatabaseService } from '../interfaces/IDatabaseService';
import {
  Mentor,
  Student,
  AllocationHistory,
  MentorNote,
  MentorshipConversation,
  AssignedCourse,
  AssignedActivity,
  SharedResource,
  StudentPortfolio,
  AISafetyAlert,
  AdminAuditLog,
  CSVImportResult,
  CSVStudentRow,
  ExplainableRisk,
  AppNotification,
  UserRole,
  Meeting,
  FollowUpTask,
  StudentGoal,
  Achievement,
  StudyPlan,
  ResumeAnalysis,
  CareerGuidance,
  CSVImportHistoryRecord,
  AcademicYear,
  Semester,
  AcademicCalendarEvent,
  InterventionRecord,
  AIMeetingSummary,
  AIMemoryItem,
  MeetingFeedback,
  StudentTrendStatus,
  StudentAcademicMark,
  IAMarksImportResult
} from '../../types';
import { DemoDatabaseService } from '../demo/DemoDatabaseService';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';

export class FirebaseDatabaseService implements IDatabaseService {
  private fallback: DemoDatabaseService;
  private mentorCache: { data: Mentor[]; timestamp: number } | null = null;
  private studentCache: { data: { students: Student[]; total: number }; timestamp: number } | null = null;
  private allocationCache: { data: AllocationHistory[]; timestamp: number } | null = null;
  private CACHE_TTL_MS = 30000; // 30s in-memory TTL

  constructor() {
    this.fallback = new DemoDatabaseService();
  }

  private invalidateCache(target?: 'mentor' | 'student' | 'allocation' | 'all') {
    if (!target || target === 'all') {
      this.mentorCache = null;
      this.studentCache = null;
      this.allocationCache = null;
    } else if (target === 'mentor') {
      this.mentorCache = null;
    } else if (target === 'student') {
      this.studentCache = null;
    } else if (target === 'allocation') {
      this.allocationCache = null;
    }
  }

  async getMentors(): Promise<Mentor[]> {
    const now = Date.now();
    if (this.mentorCache && now - this.mentorCache.timestamp < this.CACHE_TTL_MS) {
      console.log(`[PERF] Serving ${this.mentorCache.data.length} mentors from in-memory cache (0ms)`);
      return this.mentorCache.data;
    }

    const startTime = performance.now();

    if (!isFirebaseConfigured || !db) {
      const mentors = await this.fallback.getMentors();
      this.mentorCache = { data: mentors, timestamp: now };
      return mentors;
    }

    try {
      // Parallel execution for Firestore collections + local seed fallback
      const [mentorsSnap, usersSnap, fallbackMentors] = await Promise.all([
        getDocs(collection(db, 'mentors')).catch(() => null),
        getDocs(query(collection(db, 'users'), where('role', '==', 'mentor'))).catch(() => null),
        this.fallback.getMentors(),
      ]);

      const mentorsList: Mentor[] = [];

      if (mentorsSnap) {
        mentorsSnap.forEach((d) => {
          const data = d.data();
          mentorsList.push({
            id: d.id,
            userId: data.userId || d.id,
            name: data.name || 'Unnamed Mentor',
            email: data.email || '',
            phone: data.phone || '',
            department: data.department || 'General',
            staffId: data.staffId || d.id,
            activeMenteesCount: data.activeMenteesCount || 0,
            status: data.status === 'inactive' || data.status === 'deactivated' ? 'inactive' : 'active',
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });
      }

      if (usersSnap) {
        usersSnap.forEach((uDoc) => {
          const uData = uDoc.data();
          const existing = mentorsList.find(m => m.userId === uDoc.id || m.email.toLowerCase() === (uData.email || '').toLowerCase());
          if (!existing) {
            mentorsList.push({
              id: uDoc.id,
              userId: uDoc.id,
              name: uData.name || 'Faculty Mentor',
              email: uData.email || '',
              phone: uData.phone || '',
              department: uData.department || 'General',
              staffId: uData.staffId || uDoc.id.substring(0, 8),
              activeMenteesCount: uData.activeMenteesCount || 0,
              status: uData.status === 'inactive' || uData.status === 'deactivated' ? 'inactive' : 'active',
              createdAt: uData.createdAt || new Date().toISOString(),
            });
          }
        });
      }

      for (const fbM of fallbackMentors) {
        if (!mentorsList.some(m => m.email.toLowerCase() === fbM.email.toLowerCase() || m.id === fbM.id)) {
          mentorsList.push(fbM);
        }
      }

      this.mentorCache = { data: mentorsList, timestamp: Date.now() };
      const duration = Math.round(performance.now() - startTime);
      console.log(`[PERF] Mentor list loaded in ${duration}ms (${mentorsList.length} mentors)`);
      return mentorsList;
    } catch (err) {
      console.warn('[FirebaseDatabaseService] Failed to read /mentors from Firestore:', err);
      const fallbackList = await this.fallback.getMentors();
      this.mentorCache = { data: fallbackList, timestamp: Date.now() };
      return fallbackList;
    }
  }

  async getMentorById(id: string): Promise<Mentor | null> {
    const mentors = await this.getMentors();
    return mentors.find(m => m.id === id || m.userId === id) || null;
  }

  async createMentor(mentorData: Omit<Mentor, 'id' | 'createdAt' | 'activeMenteesCount' | 'status'>, actorId: string): Promise<Mentor> {
    try {
      const res = await fetch('http://localhost:5000/api/admin/create-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: mentorData.name,
          email: mentorData.email,
          phone: mentorData.phone,
          department: mentorData.department,
          staffId: mentorData.staffId,
          actorId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.mentor) {
          try {
            await this.fallback.putMentor(data.mentor);
          } catch {
            // Ignore fallback sync error
          }
          this.invalidateCache('mentor');
          return data.mentor as Mentor;
        }
        throw new Error(data.error || 'Failed to create mentor account.');
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned status ${res.status}`);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to backend server (http://localhost:5000). Please ensure the backend server is running.');
      }
      throw err;
    }
  }

  async updateMentor(id: string, updates: Partial<Mentor>, actorId: string): Promise<Mentor> {
    const updated = await this.fallback.updateMentor(id, updates, actorId);
    this.invalidateCache('mentor');
    return updated;
  }

  async deactivateMentor(id: string, actorId: string): Promise<void> {
    try {
      const res = await fetch('http://localhost:5000/api/admin/deactivate-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: id, actorId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned status ${res.status}`);
      }
      await this.fallback.deactivateMentor(id, actorId);
      this.invalidateCache('mentor');
    } catch (err: any) {
      if (err.message && err.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to backend server (http://localhost:5000). Please ensure the backend server is running.');
      }
      throw err;
    }
  }

  async reactivateMentor(id: string, actorId: string): Promise<void> {
    try {
      const res = await fetch('http://localhost:5000/api/admin/reactivate-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: id, actorId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned status ${res.status}`);
      }
      await this.fallback.reactivateMentor(id, actorId);
      this.invalidateCache('mentor');
    } catch (err: any) {
      if (err.message && err.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to backend server (http://localhost:5000). Please ensure the backend server is running.');
      }
      throw err;
    }
  }

  async deleteMentor(id: string, actorId: string): Promise<void> {
    try {
      const res = await fetch('http://localhost:5000/api/admin/delete-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: id, actorId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned status ${res.status}`);
      }
      await this.fallback.deleteMentor(id, actorId);
      this.invalidateCache('mentor');
    } catch (err: any) {
      if (err.message && err.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to backend server (http://localhost:5000). Please ensure the backend server is running.');
      }
      throw err;
    }
  }

  async getStudents(page = 1, limit = 50, filters?: Record<string, any>, options?: { skipCache?: boolean }): Promise<{ students: Student[]; total: number }> {
    const now = Date.now();
    if (!options?.skipCache && this.studentCache && now - this.studentCache.timestamp < this.CACHE_TTL_MS) {
      console.log(`[PERF] Serving ${this.studentCache.data.total} students from in-memory cache (0ms)`);
      return this.studentCache.data;
    }

    const startTime = performance.now();

    if (!isFirebaseConfigured || !db) {
      const res = await this.fallback.getStudents(page, limit, filters);
      this.studentCache = { data: res, timestamp: now };
      return res;
    }

    try {
      const [studentsSnap, fallbackRes] = await Promise.all([
        getDocs(collection(db, 'students')).catch(() => null),
        this.fallback.getStudents(page, limit, filters),
      ]);

      const studentsList: Student[] = [];

      if (studentsSnap) {
        studentsSnap.forEach((d) => {
          const data = d.data();
          studentsList.push({
            id: d.id,
            userId: data.uid || data.userId || d.id,
            usn: data.usn || d.id,
            name: data.name || 'Student',
            email: data.email || '',
            phone: data.phone || '',
            parentPhone: data.parentPhone || '',
            department: data.department || 'Computer Science & Engineering',
            program: data.program || 'B.Tech',
            year: data.year || '3rd Year',
            semester: data.semester || 'Semester 6',
            section: data.section || 'A',
            admissionYear: data.admissionYear || '2023',
            mentorId: data.mentorId || undefined,
            mentorName: data.mentorName || undefined,
            mentorEmail: data.mentorEmail || undefined,
            cgpa: typeof data.cgpa === 'number' ? data.cgpa : 8.0,
            attendance: typeof data.attendance === 'number' ? data.attendance : 85,
            financialScore: data.financialScore || 5,
            studyHours: data.studyHours || 15,
            previousYearBacklogs: data.previousYearBacklogs || 0,
            currentBacklogs: data.currentBacklogs || 0,
            academicStatus: data.academicStatus || 'Active',
            riskLevel: data.riskLevel || 'GOOD_PERFORMANCE',
            riskReasons: data.riskReasons || [],
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });
      }

      for (const fbS of fallbackRes.students) {
        if (!studentsList.some(s => s.id === fbS.id || s.usn === fbS.usn || s.email.toLowerCase() === fbS.email.toLowerCase())) {
          studentsList.push(fbS);
        }
      }

      const total = studentsList.length;
      const start = (page - 1) * limit;
      const paginated = studentsList.slice(start, start + limit);
      const result = { students: paginated, total };

      this.studentCache = { data: result, timestamp: Date.now() };
      const duration = Math.round(performance.now() - startTime);
      console.log(`[PERF] Student list loaded in ${duration}ms (${total} students)`);
      return result;
    } catch (err) {
      console.warn('[FirebaseDatabaseService] Failed to read /students from Firestore:', err);
      const res = await this.fallback.getStudents(page, limit, filters);
      this.studentCache = { data: res, timestamp: Date.now() };
      return res;
    }
  }

  async getStudentById(id: string): Promise<Student | null> {
    const res = await this.getStudents(1, 1000);
    return res.students.find(s => s.id === id || s.usn === id || s.userId === id) || null;
  }

  async getStudentsByMentorId(mentorId: string): Promise<Student[]> {
    if (!isFirebaseConfigured || !db) {
      return this.fallback.getStudentsByMentorId(mentorId);
    }

    try {
      const [allocSnap, fallbackStudents, allStudentsRes] = await Promise.all([
        getDocs(query(collection(db, 'mentorAllocations'), where('mentorId', '==', mentorId), where('status', '==', 'ACTIVE'))).catch(() => null),
        this.fallback.getStudentsByMentorId(mentorId),
        this.getStudents(1, 1000, undefined, { skipCache: true }),
      ]);

      const studentIds = new Set<string>();
      if (allocSnap) {
        allocSnap.forEach(d => studentIds.add(d.data().studentId));
      }

      const fallbackMap = new Map<string, Student>();
      for (const s of fallbackStudents) {
        studentIds.add(s.id);
        fallbackMap.set(s.id, s);
        fallbackMap.set(s.usn, s);
      }

      const allocatedFromAll = allStudentsRes.students.filter((s) => {
        const match = fallbackMap.get(s.id) || fallbackMap.get(s.usn);
        const activeMentorId = match?.mentorId || s.mentorId;
        return studentIds.has(s.id) || activeMentorId === mentorId;
      });

      return allocatedFromAll.map((s) => {
        const match = fallbackMap.get(s.id) || fallbackMap.get(s.usn);
        if (!match) return s;
        return {
          ...s,
          mentorId: match.mentorId || s.mentorId,
          mentorName: match.mentorName || s.mentorName,
          mentorEmail: match.mentorEmail || s.mentorEmail,
          cgpa: typeof match.cgpa === 'number' ? match.cgpa : s.cgpa,
          attendance: typeof match.attendance === 'number' ? match.attendance : s.attendance,
          previousYearBacklogs: typeof match.previousYearBacklogs === 'number' ? match.previousYearBacklogs : s.previousYearBacklogs,
          currentBacklogs: typeof match.currentBacklogs === 'number' ? match.currentBacklogs : s.currentBacklogs,
          riskLevel: match.riskLevel || s.riskLevel,
          riskReasons: match.riskReasons || s.riskReasons,
        };
      });
    } catch (err) {
      return this.fallback.getStudentsByMentorId(mentorId);
    }
  }

  async createStudent(studentData: Omit<Student, 'id' | 'createdAt' | 'riskLevel' | 'riskReasons'>, actorId: string): Promise<Student> {
    const created = await this.fallback.createStudent(studentData, actorId);
    this.invalidateCache('student');
    return created;
  }

  async updateStudent(id: string, updates: Partial<Student>, actorId: string): Promise<Student> {
    const updated = await this.fallback.updateStudent(id, updates, actorId);
    this.invalidateCache('student');
    return updated;
  }

  async importStudentsCSV(csvRows: CSVStudentRow[], actorId: string, duplicateStrategy?: 'skip' | 'update' | 'cancel'): Promise<CSVImportResult> {
    const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : (process.env || {});
    const isProductionMode = String(env.VITE_DEMO_MODE) === 'false';

    if (!isProductionMode) {
      const res = await this.fallback.importStudentsCSV(csvRows, actorId, duplicateStrategy);
      this.invalidateCache('student');
      return res;
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/import-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvRows, actorId, duplicateStrategy }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        for (const r of data.results) {
          if (r.status === 'success' && r.student) {
            try {
              await this.fallback.putStudent(r.student);
            } catch {
              // Ignore fallback put error
            }
          }
        }
        this.invalidateCache('all');

        const importedStudentsList: Student[] = data.results.filter((r: any) => r.status === 'success' && r.student).map((r: any) => r.student);

        return {
          totalRows: data.totalRows || csvRows.length,
          successfulCount: data.importedCount || 0,
          importedCount: data.importedCount || 0,
          updatedCount: 0,
          skippedCount: data.skippedCount || 0,
          failedCount: data.failedCount || 0,
          duplicateCount: data.skippedCount || 0,
          mentorAllocationErrorCount: 0,
          importedStudents: importedStudentsList,
          errors: data.results.filter((r: any) => r.status === 'failed').map((r: any) => ({
            rowNumber: r.rowNumber,
            usn: r.usn,
            name: r.name,
            reason: r.reason,
          })),
          details: data.results.map((r: any) => ({
            rowNumber: r.rowNumber,
            usn: r.usn,
            name: r.name,
            email: r.email,
            department: r.department || 'Computer Science & Engineering',
            isValid: r.status === 'success',
            status: r.status === 'success' ? 'VALID' : r.status === 'skipped' ? 'WARNING' : 'ERROR',
            warnings: r.status === 'skipped' ? [r.reason] : [],
            errors: r.status === 'failed' ? [r.reason] : [],
            rawData: r,
          })),
        };
      }
      throw new Error(data.error || 'Failed to import student CSV batch.');
    } catch (err: any) {
      if (err.message && err.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to backend server (http://localhost:5000). Please ensure the backend server is running.');
      }
      throw err;
    }
  }

  async allocateStudent(studentId: string, mentorId: string, changedBy: string, reason?: string): Promise<void> {
    await this.fallback.allocateStudent(studentId, mentorId, changedBy, reason);

    if (db && isFirebaseConfigured) {
      try {
        const allocId = `${mentorId}_${studentId}`;
        await setDoc(doc(db, 'mentorAllocations', allocId), {
          id: allocId,
          mentorId,
          studentId,
          changedBy,
          reason: reason || 'Administrative mentee mapping',
          status: 'ACTIVE',
          timestamp: new Date().toISOString(),
        }).catch((e) => {
          console.warn('[Firestore Allocation Write Notice]:', e.message);
        });
      } catch (err) {
        console.warn('[FirebaseDatabaseService] Failed to write allocation to Firestore:', err);
      }
    }
    this.invalidateCache('all');
  }

  async bulkAllocateStudents(studentIds: string[], mentorId: string, changedBy: string, options?: { reassignAll?: boolean; reason?: string }): Promise<{ allocatedCount: number; skippedCount: number; failedCount: number }> {
    const res = await this.fallback.bulkAllocateStudents(studentIds, mentorId, changedBy, options);
    if (db && isFirebaseConfigured) {
      const safeWrite = (p: Promise<any>) => Promise.race([p, new Promise(r => setTimeout(r, 600))]).catch(() => null);
      try {
        for (const stId of studentIds) {
          const prevAllocs = await getDocs(query(collection(db, 'mentorAllocations'), where('studentId', '==', stId), where('status', '==', 'ACTIVE'))).catch(() => null);
          if (prevAllocs) {
            for (const docSnap of prevAllocs.docs) {
              if (docSnap.data().mentorId !== mentorId) {
                await safeWrite(setDoc(doc(db, 'mentorAllocations', docSnap.id), { status: 'REASSIGNED' }, { merge: true }));
              }
            }
          }

          const allocId = `${mentorId}_${stId}`;
          await safeWrite(setDoc(doc(db, 'mentorAllocations', allocId), {
            id: allocId,
            mentorId,
            studentId: stId,
            changedBy,
            reason: options?.reason || 'Administrative mentee mapping',
            status: 'ACTIVE',
            timestamp: new Date().toISOString(),
          }));

          await safeWrite(setDoc(doc(db, 'students', stId), {
            mentorId,
          }, { merge: true }));
        }
      } catch (e: any) {
        console.warn('[Firestore Bulk Allocation Write Notice]:', e.message);
      }
    }
    this.invalidateCache('all');
    return res;
  }

  async getAllocationHistory(studentId?: string): Promise<AllocationHistory[]> {
    const now = Date.now();
    if (!studentId && this.allocationCache && now - this.allocationCache.timestamp < this.CACHE_TTL_MS) {
      console.log(`[PERF] Serving ${this.allocationCache.data.length} allocation history records from in-memory cache (0ms)`);
      return this.allocationCache.data;
    }

    const history = await this.fallback.getAllocationHistory(studentId);
    if (!studentId) {
      this.allocationCache = { data: history, timestamp: now };
    }
    return history;
  }

  calculateExplainableRisk(student: Partial<Student>): ExplainableRisk {
    return this.fallback.calculateExplainableRisk(student);
  }

  evaluateStudentTrend(student: Student): StudentTrendStatus {
    return this.fallback.evaluateStudentTrend(student);
  }

  async getMentorNotes(studentId: string): Promise<MentorNote[]> {
    return this.fallback.getMentorNotes(studentId);
  }

  async addMentorNote(note: Omit<MentorNote, 'id' | 'timestamp'>): Promise<MentorNote> {
    return this.fallback.addMentorNote(note);
  }

  async getConversation(studentId: string, mentorId: string): Promise<MentorshipConversation | null> {
    return this.fallback.getConversation(studentId, mentorId);
  }

  async sendMessageToConversation(studentId: string, mentorId: string, senderRole: 'mentor' | 'student', text: string, senderName: string): Promise<MentorshipConversation> {
    return this.fallback.sendMessageToConversation(studentId, mentorId, senderRole, text, senderName);
  }

  async getAssignedCourses(studentId: string): Promise<AssignedCourse[]> {
    return this.fallback.getAssignedCourses(studentId);
  }

  async assignCourse(course: Omit<AssignedCourse, 'id' | 'assignedDate'>): Promise<AssignedCourse> {
    return this.fallback.assignCourse(course);
  }

  async updateCourseProgress(courseId: string, completionPercentage: number, completedActivities: number): Promise<AssignedCourse> {
    return this.fallback.updateCourseProgress(courseId, completionPercentage, completedActivities);
  }

  async getAssignedActivities(studentId: string): Promise<AssignedActivity[]> {
    return this.fallback.getAssignedActivities(studentId);
  }

  async assignActivity(activity: Omit<AssignedActivity, 'id' | 'assignedDate'>): Promise<AssignedActivity> {
    return this.fallback.assignActivity(activity);
  }

  async getSharedResources(department?: string, studentId?: string): Promise<SharedResource[]> {
    return this.fallback.getSharedResources(department, studentId);
  }

  async shareResource(resource: Omit<SharedResource, 'id' | 'timestamp'>, actorId: string): Promise<SharedResource> {
    return this.fallback.shareResource(resource, actorId);
  }

  async getStudentPortfolio(studentId: string): Promise<StudentPortfolio> {
    return this.fallback.getStudentPortfolio(studentId);
  }

  async updateStudentPortfolio(studentId: string, updates: Partial<StudentPortfolio>): Promise<StudentPortfolio> {
    return this.fallback.updateStudentPortfolio(studentId, updates);
  }

  async getAISafetyAlerts(mentorId?: string): Promise<AISafetyAlert[]> {
    return this.fallback.getAISafetyAlerts(mentorId);
  }

  async createAISafetyAlert(alert: Omit<AISafetyAlert, 'id' | 'timestamp' | 'status'>, actorId?: string): Promise<AISafetyAlert> {
    return this.fallback.createAISafetyAlert(alert, actorId);
  }

  async updateAISafetyAlertStatus(alertId: string, status: AISafetyAlert['status'], reviewerNotes: string, actorId: string): Promise<AISafetyAlert> {
    return this.fallback.updateAISafetyAlertStatus(alertId, status, reviewerNotes, actorId);
  }

  async getNotifications(userId: string, role?: UserRole): Promise<AppNotification[]> {
    return this.fallback.getNotifications(userId, role);
  }

  async createNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): Promise<AppNotification> {
    return this.fallback.createNotification(notification);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    return this.fallback.markNotificationRead(notificationId);
  }

  async getAuditLogs(limit?: number): Promise<AdminAuditLog[]> {
    return this.fallback.getAuditLogs(limit);
  }

  async logAuditEvent(event: Omit<AdminAuditLog, 'id' | 'timestamp'>): Promise<AdminAuditLog> {
    return this.fallback.logAuditEvent(event);
  }

  async getMeetings(filter?: { studentId?: string; mentorId?: string }): Promise<Meeting[]> {
    return this.fallback.getMeetings(filter);
  }

  async createMeeting(meeting: Omit<Meeting, 'id' | 'createdAt' | 'status'>, actorId: string): Promise<Meeting> {
    return this.fallback.createMeeting(meeting, actorId);
  }

  async updateMeetingStatus(meetingId: string, status: Meeting['status'], notes?: string): Promise<Meeting> {
    return this.fallback.updateMeetingStatus(meetingId, status, notes);
  }

  async getFollowUpTasks(filter?: { studentId?: string; mentorId?: string }): Promise<FollowUpTask[]> {
    return this.fallback.getFollowUpTasks(filter);
  }

  async createFollowUpTask(task: Omit<FollowUpTask, 'id' | 'createdAt' | 'status'>, actorId: string): Promise<FollowUpTask> {
    return this.fallback.createFollowUpTask(task, actorId);
  }

  async updateTaskStatus(taskId: string, status: FollowUpTask['status']): Promise<FollowUpTask> {
    return this.fallback.updateTaskStatus(taskId, status);
  }

  async getStudentGoals(studentId: string): Promise<StudentGoal[]> {
    return this.fallback.getStudentGoals(studentId);
  }

  async createStudentGoal(goal: Omit<StudentGoal, 'id' | 'createdAt'>): Promise<StudentGoal> {
    return this.fallback.createStudentGoal(goal);
  }

  async updateStudentGoal(goalId: string, updates: Partial<StudentGoal>): Promise<StudentGoal> {
    return this.fallback.updateStudentGoal(goalId, updates);
  }

  async getStudentAchievements(studentId: string): Promise<Achievement[]> {
    return this.fallback.getStudentAchievements(studentId);
  }

  async unlockAchievement(studentId: string, badgeKey: Achievement['badgeKey'], title: string, description: string, icon: string): Promise<Achievement> {
    return this.fallback.unlockAchievement(studentId, badgeKey, title, description, icon);
  }

  async getStudyPlan(studentId: string): Promise<StudyPlan | null> {
    return this.fallback.getStudyPlan(studentId);
  }

  async saveStudyPlan(plan: Omit<StudyPlan, 'id' | 'createdAt'>): Promise<StudyPlan> {
    return this.fallback.saveStudyPlan(plan);
  }

  async getResumeAnalysis(studentId: string): Promise<ResumeAnalysis | null> {
    return this.fallback.getResumeAnalysis(studentId);
  }

  async saveResumeAnalysis(analysis: Omit<ResumeAnalysis, 'id' | 'analyzedAt'>): Promise<ResumeAnalysis> {
    return this.fallback.saveResumeAnalysis(analysis);
  }

  async getCareerGuidance(studentId: string): Promise<CareerGuidance | null> {
    return this.fallback.getCareerGuidance(studentId);
  }

  async saveCareerGuidance(guidance: Omit<CareerGuidance, 'id' | 'generatedAt'>): Promise<CareerGuidance> {
    return this.fallback.saveCareerGuidance(guidance);
  }

  async getCSVImportHistory(): Promise<CSVImportHistoryRecord[]> {
    return this.fallback.getCSVImportHistory();
  }

  async logCSVImportHistory(record: Omit<CSVImportHistoryRecord, 'id' | 'timestamp'>): Promise<CSVImportHistoryRecord> {
    return this.fallback.logCSVImportHistory(record);
  }

  // --- PHASE 3 METHODS EXTENSIONS ---

  async getAcademicYears(): Promise<AcademicYear[]> {
    return this.fallback.getAcademicYears();
  }

  async createAcademicYear(year: Omit<AcademicYear, 'id'>): Promise<AcademicYear> {
    return this.fallback.createAcademicYear(year);
  }

  async updateAcademicYear(id: string, updates: Partial<AcademicYear>): Promise<AcademicYear> {
    return this.fallback.updateAcademicYear(id, updates);
  }

  async getSemesters(): Promise<Semester[]> {
    return this.fallback.getSemesters();
  }

  async createSemester(sem: Omit<Semester, 'id'>): Promise<Semester> {
    return this.fallback.createSemester(sem);
  }

  async updateSemester(id: string, updates: Partial<Semester>): Promise<Semester> {
    return this.fallback.updateSemester(id, updates);
  }

  async setActiveSemester(semesterId: string): Promise<void> {
    return this.fallback.setActiveSemester(semesterId);
  }

  async archiveSemester(semesterId: string): Promise<void> {
    return this.fallback.archiveSemester(semesterId);
  }

  async importIAMarksCSV(
    rows: Record<string, any>[],
    academicYear: string,
    semester: string,
    actorId: string
  ): Promise<IAMarksImportResult> {
    const res = await this.fallback.importIAMarksCSV(rows, academicYear, semester, actorId);
    this.invalidateCache('all');
    return res;
  }

  async getStudentAcademicMarks(studentId: string): Promise<StudentAcademicMark[]> {
    return this.fallback.getStudentAcademicMarks(studentId);
  }

  async editStudent(id: string, updates: Partial<Student>, actorId: string): Promise<Student> {
    const res = await this.fallback.editStudent(id, updates, actorId);
    this.invalidateCache('all');
    return res;
  }

  async deleteStudent(id: string, actorId: string): Promise<void> {
    await this.fallback.deleteStudent(id, actorId);
    this.invalidateCache('all');
  }

  async getCalendarEvents(department?: string, semester?: string): Promise<AcademicCalendarEvent[]> {
    return this.fallback.getCalendarEvents(department, semester);
  }

  async createCalendarEvent(event: Omit<AcademicCalendarEvent, 'id' | 'createdAt'>): Promise<AcademicCalendarEvent> {
    return this.fallback.createCalendarEvent(event);
  }

  async getInterventions(filter?: { mentorId?: string; studentId?: string; status?: string }): Promise<InterventionRecord[]> {
    return this.fallback.getInterventions(filter);
  }

  async createIntervention(intervention: Omit<InterventionRecord, 'id' | 'createdAt'>, actorId: string): Promise<InterventionRecord> {
    return this.fallback.createIntervention(intervention, actorId);
  }

  async updateInterventionStatus(interventionId: string, status: InterventionRecord['status'], actionsTaken?: string[], outcomeCgpa?: number, outcomeAttendance?: number, actorId?: string): Promise<InterventionRecord> {
    return this.fallback.updateInterventionStatus(interventionId, status, actionsTaken, outcomeCgpa, outcomeAttendance, actorId);
  }

  async getAIMeetingSummary(meetingId: string): Promise<AIMeetingSummary | null> {
    return this.fallback.getAIMeetingSummary(meetingId);
  }

  async saveAIMeetingSummary(summary: Omit<AIMeetingSummary, 'id' | 'createdAt'>): Promise<AIMeetingSummary> {
    return this.fallback.saveAIMeetingSummary(summary);
  }

  async getAIMemories(studentId: string): Promise<AIMemoryItem[]> {
    return this.fallback.getAIMemories(studentId);
  }

  async saveAIMemory(memory: Omit<AIMemoryItem, 'id' | 'createdAt'>): Promise<AIMemoryItem> {
    return this.fallback.saveAIMemory(memory);
  }

  async deleteAIMemory(memoryId: string): Promise<void> {
    return this.fallback.deleteAIMemory(memoryId);
  }

  async getMeetingFeedback(mentorId?: string, meetingId?: string): Promise<MeetingFeedback[]> {
    return this.fallback.getMeetingFeedback(mentorId, meetingId);
  }

  async submitMeetingFeedback(feedback: Omit<MeetingFeedback, 'id' | 'timestamp'>): Promise<MeetingFeedback> {
    return this.fallback.submitMeetingFeedback(feedback);
  }

  async resetDemoData(): Promise<void> {
    this.invalidateCache('all');
    return this.fallback.resetDemoData();
  }
}
