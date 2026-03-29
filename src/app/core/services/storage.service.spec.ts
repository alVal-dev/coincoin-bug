import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    service = TestBed.inject(StorageService);
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('writes and reads a string value', () => {
    expect(service.setItem('duck_theme', 'light')).toBe(true);
    expect(service.getItem('duck_theme')).toBe('light');
  });

  it('returns null for a missing key', () => {
    expect(service.getItem('missing_key')).toBeNull();
    expect(service.hasItem('missing_key')).toBe(false);
  });

  it('removes a stored value', () => {
    sessionStorage.setItem('duck_theme', 'dark');

    expect(service.hasItem('duck_theme')).toBe(true);
    expect(service.removeItem('duck_theme')).toBe(true);
    expect(service.getItem('duck_theme')).toBeNull();
  });
});
