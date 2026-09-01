// Native IndexedDB Helper Engine for EduMentorX Demo Provider Storage (Phases 1, 2 & 3)

const DB_NAME = 'EduMentorX_Demo_DB';
const DB_VERSION = 3; // Incremented for Phase 3 stores

export const STORES = {
  MENTORS: 'mentors',
  STUDENTS: 'students',
  ALLOCATION_HISTORY: 'allocations',
  MENTOR_NOTES: 'notes',
  CONVERSATIONS: 'conversations',
  COURSES: 'courses',
  ACTIVITIES: 'activities',
  RESOURCES: 'resources',
  PORTFOLIOS: 'portfolios',
  SAFETY_ALERTS: 'safetyAlerts',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'auditLogs',
  MEETINGS: 'meetings',
  TASKS: 'followUpTasks',
  GOALS: 'goals',
  ACHIEVEMENTS: 'achievements',
  STUDY_PLANS: 'studyPlans',
  RESUME_ANALYSES: 'resumeAnalyses',
  CAREER_GUIDANCE: 'careerGuidance',
  IMPORT_HISTORY: 'importHistory',
  // Phase 3 Stores
  ACADEMIC_YEARS: 'academicYears',
  SEMESTERS: 'semesters',
  CALENDAR_EVENTS: 'calendarEvents',
  INTERVENTIONS: 'interventions',
  AI_MEETING_SUMMARIES: 'aiMeetingSummaries',
  AI_MEMORIES: 'aiMemories',
  MEETING_FEEDBACK: 'meetingFeedback',
};

class IndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        Object.values(STORES).forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  }

  async getById<T>(storeName: string, id: string): Promise<T | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as T) || null);
      req.onerror = () => reject(req.error);
    });
  }

  async put<T extends { id: string }>(storeName: string, item: T): Promise<T> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    });
  }

  async putAll<T extends { id: string }>(storeName: string, items: T[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      items.forEach((item) => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteById(storeName: string, id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clearAllStores(): Promise<void> {
    const db = await this.getDB();
    const storeNames = Array.from(db.objectStoreNames);
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeNames, 'readwrite');
      storeNames.forEach((s) => tx.objectStore(s).clear());
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const idbService = new IndexedDBService();
