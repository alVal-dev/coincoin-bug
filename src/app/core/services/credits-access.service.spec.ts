import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { STORAGE_KEYS } from '../../models';
import { CreditsAccessService } from './credits-access.service';
import { StorageService } from './storage.service';

describe('CreditsAccessService', () => {
  let service: CreditsAccessService;
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    sessionStorage.clear();

    service = TestBed.inject(CreditsAccessService);
    storageService = TestBed.inject(StorageService);
  });

  it('returns false when the access flag is missing', () => {
    expect(service.hasAccess()).toBe(false);
  });

  it('grants access by storing the true flag', () => {
    expect(service.grantAccess()).toBe(true);
    expect(storageService.getItem(STORAGE_KEYS.creditsAccess)).toBe('true');
    expect(service.hasAccess()).toBe(true);
  });

  it('revokes access by removing the flag', () => {
    storageService.setItem(STORAGE_KEYS.creditsAccess, 'true');

    expect(service.revokeAccess()).toBe(true);
    expect(storageService.getItem(STORAGE_KEYS.creditsAccess)).toBeNull();
    expect(service.hasAccess()).toBe(false);
  });

  it('returns false for any non-true stored value', () => {
    storageService.setItem(STORAGE_KEYS.creditsAccess, 'yes');

    expect(service.hasAccess()).toBe(false);
  });
});
