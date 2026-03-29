import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type Event, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatFlowService } from '../../core/services/chat-flow.service';
import { ChatRuntimeService } from '../../core/services/chat-runtime.service';
import { CreditsAccessService } from '../../core/services/credits-access.service';
import { SessionService } from '../../core/services/session.service';
import { CreditsPageComponent } from './credits-page.component';

describe('CreditsPageComponent', () => {
  const routerEvents$ = new Subject<Event>();
  const routerMock = {
    events: routerEvents$.asObservable(),
    navigate: vi.fn().mockResolvedValue(true),
  } satisfies Pick<Router, 'events' | 'navigate'>;

  beforeEach(async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [CreditsPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    }).compileComponents();
  });

  it('renders the credits page', () => {
    const fixture = TestBed.createComponent(CreditsPageComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Crédits');
    expect(fixture.nativeElement.textContent).toContain('Nouvelle session');
  });

  it('starts a new session from credits when clicking the button', () => {
    const fixture = TestBed.createComponent(CreditsPageComponent);
    const chatFlowService = TestBed.inject(ChatFlowService);
    const startNewSessionFromCreditsSpy = vi.spyOn(chatFlowService, 'startNewSessionFromCredits');

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(startNewSessionFromCreditsSpy).toHaveBeenCalledTimes(1);
  });

  it('focuses the new session button on arrival', () => {
    const fixture = TestBed.createComponent(CreditsPageComponent);

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(document.activeElement).toBe(button);
  });

  it('clears session and credits access on browser back navigation from credits', () => {
    const fixture = TestBed.createComponent(CreditsPageComponent);
    const sessionService = TestBed.inject(SessionService);
    const creditsAccessService = TestBed.inject(CreditsAccessService);
    const chatRuntimeService = TestBed.inject(ChatRuntimeService);

    const clearSessionSpy = vi.spyOn(sessionService, 'clearSession');
    const revokeAccessSpy = vi.spyOn(creditsAccessService, 'revokeAccess');
    const showBannerSpy = vi.spyOn(chatRuntimeService, 'showCreditsExitBanner');

    fixture.detectChanges();

    routerEvents$.next(
      new NavigationStart(1, '/', 'popstate', {
        navigationId: 0,
      }),
    );

    expect(clearSessionSpy).toHaveBeenCalledTimes(1);
    expect(revokeAccessSpy).toHaveBeenCalledTimes(1);
    expect(showBannerSpy).toHaveBeenCalledWith(
      'Tu as quitté les crédits. Le canard reprend son poste.',
    );
  });

  it('does not clear state on non-popstate navigation', () => {
    const fixture = TestBed.createComponent(CreditsPageComponent);
    const sessionService = TestBed.inject(SessionService);
    const creditsAccessService = TestBed.inject(CreditsAccessService);
    const chatRuntimeService = TestBed.inject(ChatRuntimeService);

    const clearSessionSpy = vi.spyOn(sessionService, 'clearSession');
    const revokeAccessSpy = vi.spyOn(creditsAccessService, 'revokeAccess');
    const showBannerSpy = vi.spyOn(chatRuntimeService, 'showCreditsExitBanner');

    fixture.detectChanges();

    routerEvents$.next(new NavigationStart(1, '/', 'imperative'));

    expect(clearSessionSpy).not.toHaveBeenCalled();
    expect(revokeAccessSpy).not.toHaveBeenCalled();
    expect(showBannerSpy).not.toHaveBeenCalled();
  });
});
