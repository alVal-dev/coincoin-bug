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
        {
          id: 'message-user-001',
          author: 'user',
          text: 'Mon bug a une forte personnalité',
          createdAt: 1_700_000_000_700,
        },
      ],
      userMessageCount: 1,
      responseHistory: [],
      messagesSinceLastSleep: 1,
      lastDuckReplyAt: 1_700_000_000_500,
    });

    chatRuntimeService.setReady();
  });

  it('renders the chat subcomponents and message history', () => {
    const fixture = TestBed.createComponent(ChatSessionComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-chat-message-list')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-message-examples-panel')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-chat-composer')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-chat-actions')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Coin de bienvenue');
    expect(fixture.nativeElement.textContent).toContain('Mon bug a une forte personnalité');
  });

  it('disables the composer while thinking', () => {
    const fixture = TestBed.createComponent(ChatSessionComponent);

    chatRuntimeService.setThinking();
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });

  it('forwards actions to ChatFlowService with the expected payloads', () => {
    const sendSpy = vi.spyOn(chatFlowService, 'sendMessage').mockImplementation(() => undefined);
    const resolveSpy = vi.spyOn(chatFlowService, 'resolveBug').mockImplementation(() => undefined);
    const newSessionSpy = vi
      .spyOn(chatFlowService, 'startNewSession')
      .mockImplementation(() => undefined);

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

    expect(sendSpy).toHaveBeenNthCalledWith(1, 'Mon CSS refuse de centrer quoi que ce soit');
    expect(sendSpy).toHaveBeenNthCalledWith(2, 'Bonjour');
    expect(resolveSpy).toHaveBeenCalledTimes(1);
    expect(newSessionSpy).toHaveBeenCalledTimes(1);
  });
});
