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

export interface IDatabaseService {
  // Mentors
  getMentors(): Promise<Mentor[]>;
  getMentorById(id: string): Promise<Mentor | null>;
  createMentor(mentor: Omit<Mentor, 'id' | 'createdAt' | 'activeMenteesCount' | 'status'>, actorId: string): Promise<Mentor>;
  updateMentor(id: string, updates: Partial<Mentor>, actorId: string): Promise<Mentor>;
  deactivateMentor(id: string, actorId: string): Promise<void>;
  reactivateMentor(id: string, actorId: string): Promise<void>;
  deleteMentor(id: string, actorId: string): Promise<void>;

  // Students
  getStudents(page?: number, limit?: number, filters?: any): Promise<{ students: Student[]; total: number }>;
  getStudentById(id: string): Promise<Student | null>;
  getStudentsByMentorId(mentorId: string): Promise<Student[]>;
  createStudent(studentData: Omit<Student, 'id' | 'createdAt' | 'riskLevel' | 'riskReasons'>, actorId: string): Promise<Student>;
  updateStudent(id: string, updates: Partial<Student>, actorId: string): Promise<Student>;
  importStudentsCSV(csvRows: CSVStudentRow[], actorId: string, duplicateStrategy?: 'skip' | 'update' | 'cancel'): Promise<CSVImportResult>;

  // Allocation
  allocateStudent(studentId: string, mentorId: string, changedBy: string, reason?: string): Promise<void>;
  bulkAllocateStudents(studentIds: string[], mentorId: string, changedBy: string, options?: { reassignAll?: boolean; reason?: string }): Promise<{ allocatedCount: number; skippedCount: number; failedCount: number }>;
  getAllocationHistory(studentId?: string): Promise<AllocationHistory[]>;

  // Risk & Trend Engine
  calculateExplainableRisk(student: Partial<Student>): ExplainableRisk;
  evaluateStudentTrend(student: Student): StudentTrendStatus;

  // Mentorship Logs & Notes
  getMentorNotes(studentId: string): Promise<MentorNote[]>;
  addMentorNote(note: Omit<MentorNote, 'id' | 'timestamp'>): Promise<MentorNote>;

  // Conversations
  getConversation(studentId: string, mentorId: string): Promise<MentorshipConversation | null>;
  sendMessageToConversation(studentId: string, mentorId: string, senderRole: 'mentor' | 'student', text: string, senderName: string): Promise<MentorshipConversation>;

  // Courses & Activities
  getAssignedCourses(studentId: string): Promise<AssignedCourse[]>;
  assignCourse(course: Omit<AssignedCourse, 'id' | 'assignedDate'>): Promise<AssignedCourse>;
  updateCourseProgress(courseId: string, completionPercentage: number, completedActivities: number): Promise<AssignedCourse>;
  getAssignedActivities(studentId: string): Promise<AssignedActivity[]>;
  assignActivity(activity: Omit<AssignedActivity, 'id' | 'assignedDate'>): Promise<AssignedActivity>;

  // Resources
  getSharedResources(department?: string, studentId?: string): Promise<SharedResource[]>;
  shareResource(resource: Omit<SharedResource, 'id' | 'timestamp'>, actorId: string): Promise<SharedResource>;

  // Career Portfolio
  getStudentPortfolio(studentId: string): Promise<StudentPortfolio>;
  updateStudentPortfolio(studentId: string, updates: Partial<StudentPortfolio>): Promise<StudentPortfolio>;

  // AI Safety Alerts
  getAISafetyAlerts(mentorId?: string): Promise<AISafetyAlert[]>;
  createAISafetyAlert(alert: Omit<AISafetyAlert, 'id' | 'timestamp' | 'status'>, actorId?: string): Promise<AISafetyAlert>;
  updateAISafetyAlertStatus(alertId: string, status: AISafetyAlert['status'], reviewerNotes: string, actorId: string): Promise<AISafetyAlert>;

  // Notifications
  getNotifications(userId: string, role?: UserRole): Promise<AppNotification[]>;
  createNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): Promise<AppNotification>;
  markNotificationRead(notificationId: string): Promise<void>;

  // Audit Logs
  getAuditLogs(limit?: number): Promise<AdminAuditLog[]>;
  logAuditEvent(event: Omit<AdminAuditLog, 'id' | 'timestamp'>): Promise<AdminAuditLog>;

  // Meetings
  getMeetings(filter?: { studentId?: string; mentorId?: string }): Promise<Meeting[]>;
  createMeeting(meeting: Omit<Meeting, 'id' | 'createdAt' | 'status'>, actorId: string): Promise<Meeting>;
  updateMeetingStatus(meetingId: string, status: Meeting['status'], notes?: string): Promise<Meeting>;

  // Tasks
  getFollowUpTasks(filter?: { studentId?: string; mentorId?: string }): Promise<FollowUpTask[]>;
  createFollowUpTask(task: Omit<FollowUpTask, 'id' | 'createdAt' | 'status'>, actorId: string): Promise<FollowUpTask>;
  updateTaskStatus(taskId: string, status: FollowUpTask['status']): Promise<FollowUpTask>;

  // Goals & Badges
  getStudentGoals(studentId: string): Promise<StudentGoal[]>;
  createStudentGoal(goal: Omit<StudentGoal, 'id' | 'createdAt'>): Promise<StudentGoal>;
  updateStudentGoal(goalId: string, updates: Partial<StudentGoal>): Promise<StudentGoal>;
  getStudentAchievements(studentId: string): Promise<Achievement[]>;
  unlockAchievement(studentId: string, badgeKey: Achievement['badgeKey'], title: string, description: string, icon: string): Promise<Achievement>;

  // AI Assistants
  getStudyPlan(studentId: string): Promise<StudyPlan | null>;
  saveStudyPlan(plan: Omit<StudyPlan, 'id' | 'createdAt'>): Promise<StudyPlan>;
  getResumeAnalysis(studentId: string): Promise<ResumeAnalysis | null>;
  saveResumeAnalysis(analysis: Omit<ResumeAnalysis, 'id' | 'analyzedAt'>): Promise<ResumeAnalysis>;
  getCareerGuidance(studentId: string): Promise<CareerGuidance | null>;
  saveCareerGuidance(guidance: Omit<CareerGuidance, 'id' | 'generatedAt'>): Promise<CareerGuidance>;

  // CSV Import History
  getCSVImportHistory(): Promise<CSVImportHistoryRecord[]>;
  logCSVImportHistory(record: Omit<CSVImportHistoryRecord, 'id' | 'timestamp'>): Promise<CSVImportHistoryRecord>;

  // Phase 3 Extensions & Admin Enhancements
  getAcademicYears(): Promise<AcademicYear[]>;
  createAcademicYear(year: Omit<AcademicYear, 'id'>): Promise<AcademicYear>;
  updateAcademicYear(id: string, updates: Partial<AcademicYear>): Promise<AcademicYear>;
  getSemesters(): Promise<Semester[]>;
  createSemester(sem: Omit<Semester, 'id'>): Promise<Semester>;
  updateSemester(id: string, updates: Partial<Semester>): Promise<Semester>;
  setActiveSemester(semesterId: string): Promise<void>;
  archiveSemester(semesterId: string): Promise<void>;
  importIAMarksCSV(rows: Record<string, any>[], academicYear: string, semester: string, actorId: string): Promise<IAMarksImportResult>;
  getStudentAcademicMarks(studentId: string): Promise<StudentAcademicMark[]>;
  editStudent(id: string, updates: Partial<Student>, actorId: string): Promise<Student>;
  deleteStudent(id: string, actorId: string): Promise<void>;
  getCalendarEvents(department?: string, semester?: string): Promise<AcademicCalendarEvent[]>;
  createCalendarEvent(event: Omit<AcademicCalendarEvent, 'id' | 'createdAt'>): Promise<AcademicCalendarEvent>;
  getInterventions(filter?: { mentorId?: string; studentId?: string; status?: string }): Promise<InterventionRecord[]>;
  createIntervention(intervention: Omit<InterventionRecord, 'id' | 'createdAt'>, actorId: string): Promise<InterventionRecord>;
  updateInterventionStatus(interventionId: string, status: InterventionRecord['status'], actionsTaken?: string[], outcomeCgpa?: number, outcomeAttendance?: number, actorId?: string): Promise<InterventionRecord>;
  getAIMeetingSummary(meetingId: string): Promise<AIMeetingSummary | null>;
  saveAIMeetingSummary(summary: Omit<AIMeetingSummary, 'id' | 'createdAt'>): Promise<AIMeetingSummary>;
  getAIMemories(studentId: string): Promise<AIMemoryItem[]>;
  saveAIMemory(memory: Omit<AIMemoryItem, 'id' | 'createdAt'>): Promise<AIMemoryItem>;
  deleteAIMemory(memoryId: string): Promise<void>;
  getMeetingFeedback(mentorId?: string, meetingId?: string): Promise<MeetingFeedback[]>;
  submitMeetingFeedback(feedback: Omit<MeetingFeedback, 'id' | 'timestamp'>): Promise<MeetingFeedback>;

  // Reset Demo Storage
  resetDemoData?(): Promise<void>;
}
