import { IStorageService } from '../interfaces/IStorageService';
import { DemoStorageService } from '../demo/DemoStorageService';

export class FirebaseStorageService implements IStorageService {
  private fallback = new DemoStorageService();

  async uploadFile(path: string, file: File): Promise<string> {
    return this.fallback.uploadFile(path, file);
  }

  async deleteFile(urlOrPath: string): Promise<void> {
    return this.fallback.deleteFile(urlOrPath);
  }
}
