import { IAuthService } from './interfaces/IAuthService';
import { IDatabaseService } from './interfaces/IDatabaseService';
import { IStorageService } from './interfaces/IStorageService';
import { IAIService } from './interfaces/IAIService';

import { DemoAuthService } from './demo/DemoAuthService';
import { DemoDatabaseService } from './demo/DemoDatabaseService';
import { DemoStorageService } from './demo/DemoStorageService';

import { FirebaseAuthService } from './firebase/FirebaseAuthService';
import { FirebaseDatabaseService } from './firebase/FirebaseDatabaseService';
import { FirebaseStorageService } from './firebase/FirebaseStorageService';

import { AIServiceImpl } from './ai/AIServiceImpl';
import { isFirebaseConfigured } from './firebase/firebaseConfig';

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !isFirebaseConfigured;

console.log(`[EduMentorX] Running in ${isDemoMode ? 'DEMO MODE (Local IndexedDB Seed)' : 'PRODUCTION MODE (Firebase)'}`);

export const authService: IAuthService = isDemoMode
  ? new DemoAuthService()
  : new FirebaseAuthService();

export const dbService: IDatabaseService = isDemoMode
  ? new DemoDatabaseService()
  : new FirebaseDatabaseService();

export const storageService: IStorageService = isDemoMode
  ? new DemoStorageService()
  : new FirebaseStorageService();

export const aiService: IAIService = new AIServiceImpl();

export { isDemoMode };
