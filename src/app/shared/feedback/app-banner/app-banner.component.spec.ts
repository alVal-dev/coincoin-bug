import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatRuntimeService } from '../../../core/services/chat-runtime.service';
import { AppBannerComponent } from './app-banner.component';

describe('AppBannerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppBannerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders nothing when there is no banner message', () => {
    const fixture = TestBed.createComponent(AppBannerComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('renders the transient banner message', () => {
    const fixture = TestBed.createComponent(AppBannerComponent);
    const chatRuntimeService = TestBed.inject(ChatRuntimeService);

    chatRuntimeService.showCreditsExitBanner('Tu as quitté les crédits.');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tu as quitté les crédits.');
  });

  it('stops rendering the banner after the configured timeout', async () => {
    vi.useFakeTimers();

    const fixture = TestBed.createComponent(AppBannerComponent);
    const chatRuntimeService = TestBed.inject(ChatRuntimeService);

    chatRuntimeService.showCreditsExitBanner('Tu as quitté les crédits.');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tu as quitté les crédits.');

    await vi.advanceTimersByTimeAsync(5_000);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});
