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
  MeetingFeedback
} from '../types';

export const initialMentors: Mentor[] = [
  {
    id: 'm1',
    userId: 'u_m1',
    name: 'Dr. Sarah Jenkins',
    email: 'mentor.sarah@edumentorx.edu',
    phone: '+1 (555) 234-5678',
    department: 'Computer Science & Engineering',
    staffId: 'EMP-CS-101',
    activeMenteesCount: 5,
    status: 'active',
    createdAt: '2025-08-15T09:00:00Z',
  },
  {
    id: 'm2',
    userId: 'u_m2',
    name: 'Prof. Rajesh Kumar',
    email: 'mentor.rajesh@edumentorx.edu',
    phone: '+1 (555) 876-5432',
    department: 'Information Science & Engineering',
    staffId: 'EMP-IS-204',
    activeMenteesCount: 5,
    status: 'active',
    createdAt: '2025-08-16T10:30:00Z',
  },
  {
    id: 'm3',
    userId: 'u_m3',
    name: 'Dr. Elena Rostova',
    email: 'mentor.elena@edumentorx.edu',
    phone: '+1 (555) 456-7890',
    department: 'Electronics & Communication',
    staffId: 'EMP-EC-309',
    activeMenteesCount: 0,
    status: 'active',
    createdAt: '2025-08-20T14:15:00Z',
  },
  {
    id: 'm4',
    userId: 'u_m4',
    name: 'Rahul Mehta',
    email: 'mentor.rahul@edumentorx.edu',
    phone: '9876543002',
    department: 'Computer Science & Engineering',
    staffId: 'EMP-CS-104',
    activeMenteesCount: 0,
    status: 'active',
    createdAt: '2025-08-21T10:00:00Z',
  },
  {
    id: 'm5',
    userId: 'u_m5',
    name: 'Priya Nair',
    email: 'mentor.priya@edumentorx.edu',
    phone: '9876543003',
    department: 'Electronics & Communication',
    staffId: 'EMP-EC-105',
    activeMenteesCount: 0,
    status: 'active',
    createdAt: '2025-08-22T11:00:00Z',
  },
];

export const initialStudents: Student[] = [
  {
    id: 's1',
    userId: 'u_s1',
    usn: '1CS21CS001',
    name: 'Alex Rivera',
    email: 'student.alex@edumentorx.edu',
    phone: '+1 (555) 111-2233',
    parentPhone: '+1 (555) 999-1111',
    department: 'Computer Science & Engineering',
    mentorId: 'm1',
    mentorName: 'Dr. Sarah Jenkins',
    mentorEmail: 'mentor.sarah@edumentorx.edu',
    attendance: 92,
    cgpa: 8.85,
    financialScore: 8,
    studyHours: 16,
    previousYearBacklogs: 0,
    riskLevel: 'GOOD_PERFORMANCE',
    riskReasons: ['Strong academic standing with CGPA of 8.85.', 'High lecture attendance rate at 92%.', 'Zero active backlogs.'],
    lastInteractionDate: '2026-08-22T11:00:00Z',
    createdAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 's2',
    userId: 'u_s2',
    usn: '1CS21CS014',
    name: 'Priya Sharma',
    email: 'priya.sharma@student.edu',
    phone: '+1 (555) 222-3344',
    parentPhone: '+1 (555) 888-2222',
    department: 'Computer Science & Engineering',
    mentorId: 'm1',
    mentorName: 'Dr. Sarah Jenkins',
    mentorEmail: 'mentor.sarah@edumentorx.edu',
    attendance: 74,
    cgpa: 6.40,
    financialScore: 5,
    studyHours: 7,
    previousYearBacklogs: 1,
    riskLevel: 'NEEDS_MONITORING',
    riskReasons: ['Attendance is 74% (Below recommended 75%).', 'CGPA is 6.40.', 'Has 1 active backlog.'],
    lastInteractionDate: '2026-08-18T14:30:00Z',
    createdAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 's3',
    userId: 'u_s3',
    usn: '1CS21CS042',
    name: 'Marcus Vance',
    email: 'marcus.vance@student.edu',
    phone: '+1 (555) 333-4455',
    parentPhone: '+1 (555) 777-3333',
    department: 'Computer Science & Engineering',
    mentorId: 'm1',
    mentorName: 'Dr. Sarah Jenkins',
    mentorEmail: 'mentor.sarah@edumentorx.edu',
    attendance: 62,
    cgpa: 5.20,
    financialScore: 3,
    studyHours: 4,
    previousYearBacklogs: 3,
    riskLevel: 'HIGH_PRIORITY',
    riskReasons: ['Critical attendance deficit at 62%.', 'CGPA of 5.20 is below target benchmark.', 'Has 3 active backlogs.'],
    lastInteractionDate: '2026-08-10T16:00:00Z',
    createdAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 's4',
    userId: 'u_s4',
    usn: '1IS21IS005',
    name: 'Sophia Chen',
    email: 'sophia.chen@student.edu',
    phone: '+1 (555) 444-5566',
    parentPhone: '+1 (555) 666-4444',
    department: 'Information Science & Engineering',
    mentorId: 'm2',
    mentorName: 'Prof. Rajesh Kumar',
    mentorEmail: 'mentor.rajesh@edumentorx.edu',
    attendance: 95,
    cgpa: 9.10,
    financialScore: 9,
    studyHours: 18,
    previousYearBacklogs: 0,
    riskLevel: 'GOOD_PERFORMANCE',
    riskReasons: ['Exceptional academic record CGPA 9.10.', '95% attendance.', 'Zero backlogs.'],
    lastInteractionDate: '2026-08-24T09:30:00Z',
    createdAt: '2025-09-01T10:00:00Z',
  },
];

export const initialAllocationHistory: AllocationHistory[] = [
  {
    id: 'alloc_hist_1',
    studentId: 's1',
    studentUsn: '1CS21CS001',
    studentName: 'Alex Rivera',
    previousMentorId: 'm2',
    previousMentorName: 'Prof. Rajesh Kumar',
    newMentorId: 'm1',
    newMentorName: 'Dr. Sarah Jenkins',
    changedBy: 'Admin User',
    timestamp: '2025-10-01T10:00:00Z',
    reason: 'Department transfer alignment from ISE to CSE.',
  },
];

export const initialMentorNotes: MentorNote[] = [
  {
    id: 'n1',
    studentId: 's1',
    mentorId: 'm1',
    mentorName: 'Dr. Sarah Jenkins',
    content: 'Discussed Semester 6 elective choices. Alex expresses strong interest in AI and Distributed Systems.',
    category: 'career',
    timestamp: '2026-08-22T11:00:00Z',
  },
];

export const initialConversations: MentorshipConversation[] = [
  {
    id: 'c1',
    studentId: 's1',
    mentorId: 'm1',
    messages: [
      {
        id: 'msg_1',
        senderRole: 'mentor',
        senderName: 'Dr. Sarah Jenkins',
        text: 'Hi Alex, how are your preparations coming along for the upcoming hackathon?',
        timestamp: '2026-08-22T10:30:00Z',
      },
      {
        id: 'msg_2',
        senderRole: 'student',
        senderName: 'Alex Rivera',
        text: 'Hello Dr. Sarah! We built the prototype using React and Node. Need your feedback on system architecture.',
        timestamp: '2026-08-22T10:45:00Z',
      },
    ],
    updatedAt: '2026-08-22T10:45:00Z',
  },
];

export const initialCourses: AssignedCourse[] = [
  {
    id: 'course_1',
    studentId: 's1',
    title: 'Advanced React & TypeScript Architecture',
    description: 'Master enterprise state management, custom hooks, and micro-frontend design patterns.',
    platform: 'Coursera / EdX',
    url: 'https://coursera.org/learn/react-typescript',
    completionPercentage: 80,
    completedActivitiesCount: 8,
    totalActivitiesCount: 10,
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    status: 'in_progress',
    assignedByMentorId: 'm1',
    assignedByMentorName: 'Dr. Sarah Jenkins',
    assignedDate: '2026-08-01T10:00:00Z',
  },
];

export const initialActivities: AssignedActivity[] = [
  {
    id: 'act_1',
    studentId: 's1',
    title: 'Publish Research Paper Draft on Cloud Edge Systems',
    description: 'Submit initial 4-page IEEE format draft for mentor review before internal deadline.',
    dueDate: '2026-09-15',
    priority: 'HIGH',
    status: 'pending',
    assignedDate: '2026-08-15T10:00:00Z',
  },
];

export const initialSharedResources: SharedResource[] = [
  {
    id: 'res_1',
    department: 'Computer Science & Engineering',
    title: 'Semester 6 Computer Networks Lecture & Lab Manual',
    description: 'Complete TCP/IP protocol suite reference guide and Wireshark lab assignments.',
    subject: 'Computer Networks',
    fileUrl: 'https://example.com/resources/cn-manual.pdf',
    fileType: 'PDF',
    category: 'Syllabus',
    tags: ['Networks', 'Wireshark', 'Lab'],
    sharedByMentorId: 'm1',
    sharedByMentorName: 'Dr. Sarah Jenkins',
    timestamp: '2026-08-05T12:00:00Z',
  },
];

export const initialPortfolios: Record<string, StudentPortfolio> = {
  s1: {
    studentId: 's1',
    extracurriculars: [
      {
        id: 'ex_1',
        activityName: 'National Hackathon 2025',
        organization: 'IEEE Student Chapter',
        role: 'Team Lead & Full-Stack Architect',
        date: '2025-11-12',
        description: 'Secured 1st Place out of 120 teams building an AI automated triage app.',
      },
    ],
    certificates: [
      {
        id: 'cert_1',
        title: 'AWS Certified Solutions Architect – Associate',
        organization: 'Amazon Web Services',
        date: '2025-12-20',
        certificateUrl: 'https://aws.amazon.com/verification/ABC123456',
      },
    ],
    projects: [
      {
        id: 'proj_1',
        title: 'EduMentorX Management System',
        description: 'AI-powered student mentor platform with real-time risk escalation and voice avatar assistant.',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Gemini AI'],
        githubUrl: 'https://github.com/alexrivera/edumentorx',
        liveUrl: 'https://edumentorx.demo.app',
      },
    ],
    codingProfiles: {
      github: 'https://github.com/alexrivera',
      leetcode: 'https://leetcode.com/alexrivera',
      hackerrank: 'https://hackerrank.com/alex_rivera',
    },
    resumeUrl: 'https://example.com/resumes/alex_rivera_resume.pdf',
    resumeName: 'Alex_Rivera_Resume_2026.pdf',
    profileCompleteness: 85,
    missingSuggestions: ['Add CodeChef / Codeforces handle', 'Upload an updated transcript'],
  },
};

export const initialAISafetyAlerts: AISafetyAlert[] = [
  {
    id: 'alert_1',
    studentId: 's3',
    studentName: 'Marcus Vance',
    studentUsn: '1CS21CS042',
    mentorId: 'm1',
    severity: 'HIGH_CONCERN',
    triggerMessage: "I don't see any point in continuing anymore.",
    contextSummary: 'Student expressed severe emotional distress regarding academic backlogs during late night chat.',
    confidenceReasoning: 'Contextual risk engine classified elevated hopelessness markers coupled with 3 active backlogs.',
    status: 'NEW',
    timestamp: '2026-08-25T01:15:00Z',
    auditLogId: 'audit_alert_1',
  },
];

export const initialAuditLogs: AdminAuditLog[] = [
  {
    id: 'log_1',
    actorId: 'admin_1',
    actorName: 'System Administrator',
    actorRole: 'admin',
    action: 'CREATE_MENTOR',
    targetType: 'Mentor',
    targetId: 'm1',
    timestamp: '2025-08-15T09:00:00Z',
    newValue: { name: 'Dr. Sarah Jenkins', department: 'CSE' },
    details: 'Initial institutional mentor account onboarding.',
  },
];

export const initialMeetings: Meeting[] = [
  {
    id: 'meet_1',
    studentId: 's1',
    studentName: 'Alex Rivera',
    mentorId: 'm1',
    mentorName: 'Dr. Sarah Jenkins',
    title: 'Mid-Semester Career & Project Milestone Review',
    date: '2026-08-28',
    time: '14:30',
    agenda: 'Review IEEE research paper draft and discuss Cloud Architect elective path.',
    notes: 'Alex is progressing ahead of schedule. Encouraged AWS certification submission.',
    status: 'upcoming',
    createdAt: '2026-08-20T10:00:00Z',
  },
];

export const initialTasks: FollowUpTask[] = [
  {
    id: 'task_1',
    studentId: 's1',
    studentName: 'Alex Rivera',
    mentorId: 'm1',
    mentorName: 'Dr. Sarah Jenkins',
    title: 'Complete LeetCode Graph Theory Problem Set (15 Problems)',
    description: 'Focus on BFS, DFS, and Dijkstra algorithm implementations.',
    dueDate: '2026-08-30',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: '2026-08-20T10:00:00Z',
  },
];

export const initialGoals: StudentGoal[] = [
  {
    id: 'goal_1',
    studentId: 's1',
    type: 'academic',
    title: 'Semester 6 Target CGPA',
    targetValue: 'CGPA 9.0+',
    targetDate: '2026-12-15',
    currentProgress: 88,
    status: 'active',
    mentorRecommendation: 'Maintain current 16 hrs/wk self-study commitment.',
    createdAt: '2026-08-01T10:00:00Z',
  },
];

export const initialAchievements: Achievement[] = [
  {
    id: 'ach_1',
    studentId: 's1',
    badgeKey: 'portfolio_complete',
    title: '🏆 Portfolio Master',
    description: 'Achieved 80%+ Career Portfolio completeness score.',
    icon: '🏆',
    unlockedAt: '2026-08-15T10:00:00Z',
  },
];

export const initialStudyPlans: StudyPlan[] = [];
export const initialResumeAnalyses: ResumeAnalysis[] = [];
export const initialCareerGuidance: CareerGuidance[] = [];
export const initialCSVImportHistory: CSVImportHistoryRecord[] = [];

// --- PHASE 3 SEED DATA ---

export const initialAcademicYears: AcademicYear[] = [
  {
    id: 'ay_2026',
    yearName: '2026–2027',
    isActive: true,
    startDate: '2026-08-01',
    endDate: '2027-06-30',
  },
];

export const initialSemesters: Semester[] = [
  {
    id: 'sem_6',
    academicYearId: 'ay_2026',
    name: 'Semester 6',
    number: 6,
    isActive: true,
    startDate: '2026-08-01',
    endDate: '2026-12-20',
  },
  {
    id: 'sem_5',
    academicYearId: 'ay_2026',
    name: 'Semester 5',
    number: 5,
    isActive: false,
    startDate: '2026-01-10',
    endDate: '2026-06-15',
  },
];

export const initialCalendarEvents: AcademicCalendarEvent[] = [
  {
    id: 'evt_1',
    title: 'Mid-Semester Internal Assessment 1',
    description: 'Internal examinations across all 6th semester subjects.',
    eventType: 'EXAM',
    startDate: '2026-09-25',
    endDate: '2026-09-28',
    department: 'Computer Science & Engineering',
    semester: 'Semester 6',
    createdBy: 'System Administrator',
    createdAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'evt_2',
    title: 'Campus Recruitment Drive – Cloud Systems',
    description: 'On-campus placement interviews for Cloud and Full-Stack roles.',
    eventType: 'PLACEMENT',
    startDate: '2026-10-15',
    endDate: '2026-10-16',
    department: 'Computer Science & Engineering',
    semester: 'Semester 6',
    createdBy: 'System Administrator',
    createdAt: '2026-08-15T10:00:00Z',
  },
];

export const initialInterventions: InterventionRecord[] = [
  {
    id: 'interv_1',
    studentId: 's3',
    studentName: 'Marcus Vance',
    studentUsn: '1CS21CS042',
    mentorId: 'm1',
    mentorName: 'Dr. Sarah Jenkins',
    createdAt: '2026-08-25T01:30:00Z',
    priority: 'HIGH_PRIORITY',
    triggerReasons: [
      'Attendance dropped to critical 62%.',
      'CGPA 5.20 is below target benchmark.',
      '3 active backlogs in Data Structures and Algorithms.',
    ],
    status: 'IN_PROGRESS',
    actionsTaken: [
      'Scheduled remedial guidance meeting for Aug 26.',
      'Assigned 10 recursion practice homework tasks.',
    ],
    followUpTaskIds: ['task_2'],
    baselineCgpa: 5.20,
    baselineAttendance: 62,
  },
];

export const initialAIMeetingSummaries: AIMeetingSummary[] = [
  {
    id: 'aims_1',
    meetingId: 'meet_1',
    studentId: 's1',
    mentorId: 'm1',
    summaryText: 'Discussed semester project milestones and career cloud certification timeline.',
    keyConcerns: ['Balancing hackathon prep with mid-term exams'],
    actionItems: ['Complete LeetCode Graph Theory set', 'Submit AWS exam application'],
    followUpDate: '2026-09-02',
    approvedByMentor: true,
    createdAt: '2026-08-20T11:00:00Z',
  },
];

export const initialAIMemories: AIMemoryItem[] = [
  {
    id: 'mem_1',
    studentId: 's1',
    key: 'Career Goal',
    category: 'career',
    value: 'Full-Stack Cloud Architect',
    approvedByStudent: true,
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'mem_2',
    studentId: 's1',
    key: 'Preferred Study Time',
    category: 'study_preference',
    value: 'Evening (6:00 PM – 9:00 PM)',
    approvedByStudent: true,
    createdAt: '2026-08-16T10:00:00Z',
  },
];

export const initialMeetingFeedback: MeetingFeedback[] = [
  {
    id: 'fb_1',
    meetingId: 'meet_1',
    studentId: 's1',
    mentorId: 'm1',
    rating: 5,
    concernAddressed: 'Yes',
    comment: 'Dr. Sarah provided clear direction on cloud architecture electives!',
    timestamp: '2026-08-20T12:00:00Z',
  },
];
