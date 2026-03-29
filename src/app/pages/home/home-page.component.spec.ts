import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatFlowService } from '../../core/services/chat-flow.service';
import { SessionService } from '../../core/services/session.service';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let sessionService: SessionService;
  let chatFlowService: ChatFlowService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    chatFlowService = TestBed.inject(ChatFlowService);
    sessionService.clearSession();
  });

  it('renders the welcome state when there is no active session', () => {
    const fixture = TestBed.createComponent(HomePageComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Raconte ton bug au canard.');
    expect(fixture.nativeElement.querySelector('app-duck-avatar')).not.toBeNull();
  });

  it('focuses the start session button on initial welcome view', async () => {
    const fixture = TestBed.createComponent(HomePageComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(document.activeElement).toBe(button);
  });

  it('starts a session when the welcome action is triggered', () => {
    const startSessionSpy = vi.spyOn(chatFlowService, 'startSession');
    const fixture = TestBed.createComponent(HomePageComponent);

    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(startSessionSpy).toHaveBeenCalledTimes(1);
  });

  it('renders the chat session when an active session exists', () => {
    sessionService.createSession({
      id: 'session-001',
      status: 'active',
      startedAt: 1_700_000_000_000,
      updatedAt: 1_700_000_000_500,
      messages: [
        {
          id: 'message-duck-001',
          author: 'duck',
          text: 'Coin de bienvenue',
          createdAt: 1_700_000_000_500,
          kind: 'opening',
          mood: 'welcoming',
          category: 'opening',
        },
      ],
      userMessageCount: 0,
      responseHistory: [],
      messagesSinceLastSleep: 0,
      lastDuckReplyAt: 1_700_000_000_500,
    });

    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-chat-session')).not.toBeNull();
  });
});
