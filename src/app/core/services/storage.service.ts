import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  getItem(key: string): string | null {
    const storage = this.getStorage();

    if (!storage) {
      return null;
    }

    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): boolean {
    const storage = this.getStorage();

    if (!storage) {
      return false;
    }

    try {
      storage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  removeItem(key: string): boolean {
    const storage = this.getStorage();

    if (!storage) {
      return false;
    }

    try {
      storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  private getStorage(): Storage | null {
    try {
      return globalThis.sessionStorage ?? null;
    } catch {
      return null;
    }
  }
}
