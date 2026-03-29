import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeService } from '../../../core/services/theme.service';
import { ThemeToggleComponent } from './theme-toggle.component';

describe('ThemeToggleComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('toggles the theme when clicked', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    const themeService = TestBed.inject(ThemeService);
    const toggleSpy = vi.spyOn(themeService, 'toggleTheme');

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(toggleSpy).toHaveBeenCalledTimes(1);
  });
});
