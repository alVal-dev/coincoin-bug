import { DOCUMENT } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StorageService } from './storage.service';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let storageService: StorageService;
  let documentRef: Document;

  const originalMatchMedia = globalThis.matchMedia;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    sessionStorage.clear();

    service = TestBed.inject(ThemeService);
    storageService = TestBed.inject(StorageService);
    documentRef = TestBed.inject(DOCUMENT);

    documentRef.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    sessionStorage.clear();
    documentRef.documentElement.removeAttribute('data-theme');
    globalThis.matchMedia = originalMatchMedia ?? createMatchMediaStub(false);
  });

  it('initializes from storage when a stored theme exists', () => {
    storageService.setItem('duck_theme', 'dark');
    globalThis.matchMedia = createMatchMediaStub(false);

    service.initialize();
    TestBed.flushEffects();

    expect(service.theme()).toBe('dark');
    expect(documentRef.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('falls back to the system preference when storage is empty', () => {
    globalThis.matchMedia = createMatchMediaStub(true);

    service.initialize();
    TestBed.flushEffects();

    expect(service.theme()).toBe('dark');
    expect(documentRef.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('persists the theme explicitly when setTheme is called', () => {
    globalThis.matchMedia = createMatchMediaStub(false);

    service.initialize();
    service.setTheme('dark');
    TestBed.flushEffects();

    expect(storageService.getItem('duck_theme')).toBe('dark');
    expect(service.theme()).toBe('dark');
    expect(documentRef.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles between light and dark themes', () => {
    globalThis.matchMedia = createMatchMediaStub(false);

    service.initialize();
    expect(service.theme()).toBe('light');

    service.toggleTheme();
    expect(service.theme()).toBe('dark');

    service.toggleTheme();
    expect(service.theme()).toBe('light');
  });

  function createMatchMediaStub(prefersDark: boolean): typeof globalThis.matchMedia {
    return vi.fn().mockImplementation((query: string) => {
      return {
        matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });
  }
});
