import { IStorageService } from '../interfaces/IStorageService';

export class DemoStorageService implements IStorageService {
  async uploadFile(path: string, file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string || `https://example.com/uploads/${file.name}`);
      };
      reader.onerror = () => {
        resolve(`https://example.com/uploads/${file.name}`);
      };
      reader.readAsDataURL(file);
    });
  }

  async deleteFile(urlOrPath: string): Promise<void> {
    // Demo cleanup noop
  }
}
