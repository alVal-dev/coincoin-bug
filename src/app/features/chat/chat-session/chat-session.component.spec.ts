import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatFlowService } from '../../../core/services/chat-flow.service';
import { ChatRuntimeService } from '../../../core/services/chat-runtime.service';
import { SessionService } from '../../../core/services/session.service';
import { ChatSessionComponent } from './chat-session.component';

describe('ChatSessionComponent', () => {
  let sessionService: SessionService;
  let chatRuntimeService: ChatRuntimeService;
  let chatFlowService: ChatFlowService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatSessionComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    chatRuntimeService = TestBed.inject(ChatRuntimeService);
    chatFlowService = TestBed.inject(ChatFlowService);

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

    chatRuntimeService.setReady();
  });

  it('renders the chat subcomponents', () => {
    const fixture = TestBed.createComponent(ChatSessionComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-message-examples-panel')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-chat-composer')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-chat-actions')).not.toBeNull();
  });

  it('disables the composer while thinking', () => {
    const fixture = TestBed.createComponent(ChatSessionComponent);

    chatRuntimeService.setThinking();
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });

  it('forwards actions to ChatFlowService', () => {
    const sendSpy = vi.spyOn(chatFlowService, 'sendMessage');
    const resolveSpy = vi.spyOn(chatFlowService, 'resolveBug');
    const newSessionSpy = vi.spyOn(chatFlowService, 'startNewSession');

    const fixture = TestBed.createComponent(ChatSessionComponent);
    fixture.detectChanges();

    const exampleButtons = fixture.nativeElement.querySelectorAll(
      '.message-examples__item',
    ) as NodeListOf<HTMLButtonElement>;
    exampleButtons[0].click();

    const composerTextarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    composerTextarea.value = 'Bonjour';
    composerTextarea.dispatchEvent(new Event('input'));
    composerTextarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    const actionButtons = fixture.nativeElement.querySelectorAll(
      '.chat-actions button',
    ) as NodeListOf<HTMLButtonElement>;

    actionButtons[0].click();
    actionButtons[1].click();

    expect(sendSpy).toHaveBeenCalledTimes(2);
    expect(resolveSpy).toHaveBeenCalledTimes(1);
    expect(newSessionSpy).toHaveBeenCalledTimes(1);
  });
});
