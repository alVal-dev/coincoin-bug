import { inject, Injectable } from '@angular/core';

import { STORAGE_KEYS } from '../../models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class CreditsAccessService {
  private readonly storageService = inject(StorageService);

  hasAccess(): boolean {
    return this.storageService.getItem(STORAGE_KEYS.creditsAccess) === 'true';
  }

  grantAccess(): boolean {
    return this.storageService.setItem(STORAGE_KEYS.creditsAccess, 'true');
  }

  revokeAccess(): boolean {
    return this.storageService.removeItem(STORAGE_KEYS.creditsAccess);
  }
}
