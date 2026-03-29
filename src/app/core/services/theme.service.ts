import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';

import { StorageService } from './storage.service';

export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'duck_theme';
const THEME_ATTRIBUTE_NAME = 'data-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageService = inject(StorageService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly themeSignal = signal<AppTheme>('light');
  private initialized = false;

  readonly theme = computed(() => this.themeSignal());

  constructor() {
    const syncEffect = effect(() => {
      const htmlElement = this.document.documentElement;
      htmlElement.setAttribute(THEME_ATTRIBUTE_NAME, this.themeSignal());
    });

    this.destroyRef.onDestroy(() => {
      syncEffect.destroy();
    });
  }

  initialize(): void {
    if (this.initialized) {
      return;
    }

    const storedTheme = this.readStoredTheme();
    const initialTheme = storedTheme ?? this.getSystemPreferredTheme();

    this.themeSignal.set(initialTheme);
    this.initialized = true;
  }

  setTheme(theme: AppTheme): void {
    this.themeSignal.set(theme);
    this.storageService.setItem(THEME_STORAGE_KEY, theme);
  }

  toggleTheme(): void {
    this.setTheme(this.themeSignal() === 'dark' ? 'light' : 'dark');
  }

  private readStoredTheme(): AppTheme | null {
    const storedValue = this.storageService.getItem(THEME_STORAGE_KEY);

    if (storedValue === 'light' || storedValue === 'dark') {
      return storedValue;
    }

    return null;
  }

  private getSystemPreferredTheme(): AppTheme {
    const supportsMatchMedia = typeof globalThis.matchMedia === 'function';

    if (!supportsMatchMedia) {
      return 'light';
    }

    return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
