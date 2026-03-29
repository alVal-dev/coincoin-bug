import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ChatRuntimeService } from '../../../core/services/chat-runtime.service';
import { AppBannerComponent } from './app-banner.component';

describe('AppBannerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppBannerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
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
});
