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
  StudentTrendStatus
} from '../../types';
import { DemoDatabaseService } from '../demo/DemoDatabaseService';

export class FirebaseDatabaseService implements IDatabaseService {
  private fallback: DemoDatabaseService;

  constructor() {
    this.fallback = new DemoDatabaseService();
  }

  async getMentors(): Promise<Mentor[]> {
    return this.fallback.getMentors();
  }

  async getMentorById(id: string): Promise<Mentor | null> {
    return this.fallback.getMentorById(id);
  }

  async createMentor(mentorData: Omit<Mentor, 'id' | 'createdAt' | 'activeMenteesCount' | 'status'>, actorId: string): Promise<Mentor> {
    return this.fallback.createMentor(mentorData, actorId);
  }

  async updateMentor(id: string, updates: Partial<Mentor>, actorId: string): Promise<Mentor> {
    return this.fallback.updateMentor(id, updates, actorId);
  }

  async deactivateMentor(id: string, actorId: string): Promise<void> {
    return this.fallback.deactivateMentor(id, actorId);
  }

  async getStudents(page?: number, limit?: number, filters?: any): Promise<{ students: Student[]; total: number }> {
    return this.fallback.getStudents(page, limit, filters);
  }

  async getStudentById(id: string): Promise<Student | null> {
    return this.fallback.getStudentById(id);
  }

  async getStudentsByMentorId(mentorId: string): Promise<Student[]> {
    return this.fallback.getStudentsByMentorId(mentorId);
  }

  async createStudent(studentData: Omit<Student, 'id' | 'createdAt' | 'riskLevel' | 'riskReasons'>, actorId: string): Promise<Student> {
    return this.fallback.createStudent(studentData, actorId);
  }

  async updateStudent(id: string, updates: Partial<Student>, actorId: string): Promise<Student> {
    return this.fallback.updateStudent(id, updates, actorId);
  }

  async importStudentsCSV(csvRows: CSVStudentRow[], actorId: string, duplicateStrategy?: 'skip' | 'update' | 'cancel'): Promise<CSVImportResult> {
    return this.fallback.importStudentsCSV(csvRows, actorId, duplicateStrategy);
  }

  async allocateStudent(studentId: string, mentorId: string, changedBy: string, reason?: string): Promise<void> {
    return this.fallback.allocateStudent(studentId, mentorId, changedBy, reason);
  }

  async bulkAllocateStudents(studentIds: string[], mentorId: string, changedBy: string, options?: { reassignAll?: boolean; reason?: string }): Promise<{ allocatedCount: number; skippedCount: number; failedCount: number }> {
    return this.fallback.bulkAllocateStudents(studentIds, mentorId, changedBy, options);
  }

  async getAllocationHistory(studentId?: string): Promise<AllocationHistory[]> {
    return this.fallback.getAllocationHistory(studentId);
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

  async getSemesters(): Promise<Semester[]> {
    return this.fallback.getSemesters();
  }

  async createSemester(sem: Omit<Semester, 'id'>): Promise<Semester> {
    return this.fallback.createSemester(sem);
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
    return this.fallback.resetDemoData();
  }
}
