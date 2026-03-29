import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CHAT_REPLY_DELAY_MS, SLEEP_DELAY_MS } from '../../config/business-rules';
import { type ChatMessage, type DuckChatMessage } from '../../models';
import { ChatRuntimeService } from './chat-runtime.service';
import { ChatFlowService } from './chat-flow.service';
import { CreditsAccessService } from './credits-access.service';
import { ResponseCatalogService } from './response-catalog.service';
import { ResponseEngineService } from './response-engine.service';
import { SessionPersistenceService } from './session-persistence.service';
import { SessionService } from './session.service';
import { ConfettiService } from './confetti.service';

function expectDuckMessage(message: ChatMessage | undefined): asserts message is DuckChatMessage {
  expect(message?.author).toBe('duck');

  if (!message || message.author !== 'duck') {
    throw new Error('Expected a duck message.');
  }
}

describe('ChatFlowService', () => {
  let service: ChatFlowService;
  let sessionService: SessionService;
  let chatRuntimeService: ChatRuntimeService;
  let responseCatalogService: ResponseCatalogService;
  let responseEngineService: ResponseEngineService;
  let sessionPersistenceService: SessionPersistenceService;
  let creditsAccessService: CreditsAccessService;
  let router: Pick<Router, 'navigate'>;
  let confettiService: ConfettiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: Router,
          useValue: {
            navigate: vi.fn().mockResolvedValue(true),
          } satisfies Pick<Router, 'navigate'>,
        },
      ],
    });

    service = TestBed.inject(ChatFlowService);
    sessionService = TestBed.inject(SessionService);
    chatRuntimeService = TestBed.inject(ChatRuntimeService);
    responseCatalogService = TestBed.inject(ResponseCatalogService);
    responseEngineService = TestBed.inject(ResponseEngineService);
    sessionPersistenceService = TestBed.inject(SessionPersistenceService);
    creditsAccessService = TestBed.inject(CreditsAccessService);
    router = TestBed.inject(Router);
    confettiService = TestBed.inject(ConfettiService);

    vi.spyOn(confettiService, 'celebrate').mockImplementation(() => undefined);

    sessionService.clearSession();
    creditsAccessService.revokeAccess();
    chatRuntimeService.clearSleepTimer();
    chatRuntimeService.setReady();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts a session with an opening message and sets runtime to ready', () => {
    const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(1_700_000_001_000);

    vi.spyOn(Math, 'random').mockReturnValue(0);

    service.startSession();

    const session = sessionService.session();
    const firstOpening = responseCatalogService.openings[0];

    expect(session).not.toBeNull();
    expect(session?.status).toBe('active');
    expect(session?.messages).toHaveLength(1);
    expect(session?.messages[0]).toEqual({
      id: 'duck-opening-1700000001000',
      author: 'duck',
      text: firstOpening.text,
      createdAt: 1_700_000_001_000,
      kind: 'opening',
      mood: firstOpening.mood,
      category: firstOpening.category,
    });
    expect(session?.userMessageCount).toBe(0);
    expect(session?.messagesSinceLastSleep).toBe(0);
    expect(session?.lastDuckReplyAt).toBe(1_700_000_001_000);
    expect(chatRuntimeService.state()).toBe('ready');

    dateNowSpy.mockRestore();
  });

  it('persists the started session through SessionService', () => {
    const createSessionSpy = vi.spyOn(sessionService, 'createSession');

    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_002_000);
    vi.spyOn(Math, 'random').mockReturnValue(0.4);

    service.startSession();

    expect(createSessionSpy).toHaveBeenCalledTimes(1);
  });

  it('ignores an empty message', () => {
    service.startSession();

    const initialMessages = sessionService.messages();

    service.sendMessage('   ');

    expect(sessionService.messages()).toEqual(initialMessages);
    expect(chatRuntimeService.state()).toBe('ready');
  });

  it('adds the user message, switches to thinking, appends a duck reply and returns to ready', async () => {
    vi.useFakeTimers();

    service.startSession();

    service.sendMessage('Mon API me déteste');

    expect(chatRuntimeService.state()).toBe('thinking');

    const messagesAfterUserSend = sessionService.messages();
    expect(messagesAfterUserSend).toHaveLength(2);
    expect(messagesAfterUserSend[1]).toEqual({
      id: expect.stringMatching(/^user-message-\d+$/),
      author: 'user',
      text: 'Mon API me déteste',
      createdAt: expect.any(Number),
    });

    await vi.advanceTimersByTimeAsync(CHAT_REPLY_DELAY_MS);

    const messagesAfterReply = sessionService.messages();
    expect(messagesAfterReply).toHaveLength(3);

    const lastMessage = messagesAfterReply.at(-1);
    expectDuckMessage(lastMessage);
    expect(lastMessage.kind).toBe('reply');

    expect(chatRuntimeService.state()).toBe('ready');
  });

  it('passes shouldAddWakeupPrefix as false in a normal reply cycle', async () => {
    vi.useFakeTimers();

    const selectReplySpy = vi.spyOn(responseEngineService, 'selectReply');

    service.startSession();
    service.sendMessage('Le runtime a explosé');

    await vi.advanceTimersByTimeAsync(CHAT_REPLY_DELAY_MS);

    expect(selectReplySpy).toHaveBeenCalledTimes(1);
    expect(selectReplySpy).toHaveBeenCalledWith({
      message: 'Le runtime a explosé',
      userMessageCount: 1,
      responseHistory: [],
      shouldAddWakeupPrefix: false,
    });
  });

  it('falls asleep after inactivity when sleep conditions are met', async () => {
    vi.useFakeTimers();

    service.startSession();

    service.sendMessage('Premier message');
    await vi.advanceTimersByTimeAsync(CHAT_REPLY_DELAY_MS);

    service.sendMessage('Deuxième message');
    await vi.advanceTimersByTimeAsync(CHAT_REPLY_DELAY_MS);

    await vi.advanceTimersByTimeAsync(SLEEP_DELAY_MS);

    const lastMessage = sessionService.messages().at(-1);
    expectDuckMessage(lastMessage);

    expect(lastMessage.kind).toBe('sleep');
    expect(chatRuntimeService.state()).toBe('sleeping');
    expect(sessionService.messagesSinceLastSleep()).toBe(0);
  });

  it('does not fall asleep if there are fewer than two user messages', async () => {
    vi.useFakeTimers();

    service.startSession();

    service.sendMessage('Un seul message');
    await vi.advanceTimersByTimeAsync(CHAT_REPLY_DELAY_MS);

    const messagesBeforeSleepWindow = [...sessionService.messages()];

    await vi.advanceTimersByTimeAsync(SLEEP_DELAY_MS);

    expect(sessionService.messages()).toEqual(messagesBeforeSleepWindow);
    expect(chatRuntimeService.state()).toBe('ready');
  });

  it('adds a wakeup prefix on the first reply after a sleep message', async () => {
    vi.useFakeTimers();

    const selectReplySpy = vi.spyOn(responseEngineService, 'selectReply');

    service.startSession();

    service.sendMessage('Premier message');
    await vi.advanceTimersByTimeAsync(CHAT_REPLY_DELAY_MS);

    service.sendMessage('Deuxième message');
    await vi.advanceTimersByTimeAsync(CHAT_REPLY_DELAY_MS);

    await vi.advanceTimersByTimeAsync(SLEEP_DELAY_MS);

    const sleepMessage = sessionService.messages().at(-1);
    expectDuckMessage(sleepMessage);
    expect(sleepMessage.kind).toBe('sleep');

    service.sendMessage('Je suis revenu');

    await vi.advanceTimersByTimeAsync(CHAT_REPLY_DELAY_MS);

    const lastCallArguments = selectReplySpy.mock.calls.at(-1)?.[0];
    expect(lastCallArguments).toEqual({
      message: 'Je suis revenu',
      userMessageCount: 3,
      responseHistory: expect.any(Array),
      shouldAddWakeupPrefix: true,
    });
  });

  it('recalculates the sleep timer on restore for an active session', async () => {
    vi.useFakeTimers();

    const now = 1_700_000_100_000;
    vi.setSystemTime(now);

    vi.spyOn(sessionPersistenceService, 'readSession').mockReturnValue({
      id: 'session-restored',
      status: 'active',
      startedAt: now - 20_000,
      updatedAt: now - 9_500,
      messages: [
        {
          id: 'duck-opening-restored',
          author: 'duck',
          text: 'Coin.',
          createdAt: now - 20_000,
          kind: 'opening',
          mood: 'welcoming',
          category: 'opening',
        },
        {
          id: 'user-message-1',
          author: 'user',
          text: 'Premier message',
          createdAt: now - 18_000,
        },
        {
          id: 'duck-reply-1',
          author: 'duck',
          text: 'Réponse du canard 1',
          createdAt: now - 17_000,
          kind: 'reply',
          mood: 'curious',
          category: 'general',
        },
        {
          id: 'user-message-2',
          author: 'user',
          text: 'Deuxième message',
          createdAt: now - 10_000,
        },
        {
          id: 'duck-reply-2',
          author: 'duck',
          text: 'Réponse du canard 2',
          createdAt: now - (SLEEP_DELAY_MS - 500),
          kind: 'reply',
          mood: 'empathetic',
          category: 'general',
        },
      ],
      userMessageCount: 2,
      responseHistory: [],
      messagesSinceLastSleep: 2,
      lastDuckReplyAt: now - (SLEEP_DELAY_MS - 500),
    });

    service.tryRestore();

    expect(sessionService.activeSession()?.id).toBe('session-restored');
    expect(chatRuntimeService.state()).toBe('ready');

    await vi.advanceTimersByTimeAsync(499);

    const lastMessageBeforeSleep = sessionService.messages().at(-1);
    expectDuckMessage(lastMessageBeforeSleep);
    expect(lastMessageBeforeSleep.kind).toBe('reply');

    await vi.advanceTimersByTimeAsync(1);

    const lastMessageAfterSleep = sessionService.messages().at(-1);
    expectDuckMessage(lastMessageAfterSleep);
    expect(lastMessageAfterSleep.kind).toBe('sleep');
    expect(chatRuntimeService.state()).toBe('sleeping');
  });

  it('does not re-arm sleep timer on restore if the last message is already a sleep message', async () => {
    vi.useFakeTimers();

    const now = 1_700_000_200_000;
    vi.setSystemTime(now);

    vi.spyOn(sessionPersistenceService, 'readSession').mockReturnValue({
      id: 'session-restored-sleep',
      status: 'active',
      startedAt: now - 20_000,
      updatedAt: now - 10_000,
      messages: [
        {
          id: 'duck-opening-restored',
          author: 'duck',
          text: 'Coin.',
          createdAt: now - 20_000,
          kind: 'opening',
          mood: 'welcoming',
          category: 'opening',
        },
        {
          id: 'user-message-1',
          author: 'user',
          text: 'Premier message',
          createdAt: now - 18_000,
        },
        {
          id: 'duck-reply-1',
          author: 'duck',
          text: 'Réponse',
          createdAt: now - 17_000,
          kind: 'reply',
          mood: 'curious',
          category: 'general',
        },
        {
          id: 'user-message-2',
          author: 'user',
          text: 'Deuxième message',
          createdAt: now - 16_000,
        },
        {
          id: 'duck-sleep-1',
          author: 'duck',
          text: 'Zzz...',
          createdAt: now - 15_000,
          kind: 'sleep',
          mood: 'sleeping',
          category: 'sleep',
        },
      ],
      userMessageCount: 2,
      responseHistory: [],
      messagesSinceLastSleep: 0,
      lastDuckReplyAt: now - 17_000,
    });

    service.tryRestore();

    expect(chatRuntimeService.state()).toBe('sleeping');

    await vi.advanceTimersByTimeAsync(SLEEP_DELAY_MS + 100);

    const sleepMessages = sessionService
      .messages()
      .filter((message) => message.author === 'duck' && message.kind === 'sleep');

    expect(sleepMessages).toHaveLength(1);
  });

  it('resolves the active session, grants credits access, celebrates and navigates to credits', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const grantAccessSpy = vi.spyOn(creditsAccessService, 'grantAccess');

    service.startSession();
    service.resolveBug();

    const resolvedSession = sessionService.resolvedSession();
    const lastMessage = resolvedSession?.messages.at(-1);

    expect(resolvedSession?.status).toBe('resolved');
    expectDuckMessage(lastMessage);
    expect(lastMessage.kind).toBe('resolution');
    expect(grantAccessSpy).toHaveBeenCalledTimes(1);
    expect(confettiService.celebrate).toHaveBeenCalledTimes(1);
    expect(chatRuntimeService.state()).toBe('celebrating');
    expect(navigateSpy).toHaveBeenCalledWith(['/credits']);
  });

  it('does nothing when resolving without an active session', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const grantAccessSpy = vi.spyOn(creditsAccessService, 'grantAccess');

    service.resolveBug();

    expect(sessionService.session()).toBeNull();
    expect(grantAccessSpy).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('starts a new session from chat without navigating', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const dateNowSpy = vi
      .spyOn(Date, 'now')
      .mockReturnValueOnce(1_700_000_500_000)
      .mockReturnValueOnce(1_700_000_500_001);

    service.startSession();
    const previousSessionId = sessionService.activeSession()?.id;

    service.startNewSession();

    const currentSession = sessionService.activeSession();

    expect(currentSession).not.toBeNull();
    expect(currentSession?.id).not.toBe(previousSessionId);
    expect(currentSession?.messages).toHaveLength(1);
    expect(navigateSpy).not.toHaveBeenCalled();

    dateNowSpy.mockRestore();
  });

  it('starts a new session from credits, revokes access and navigates home', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const revokeAccessSpy = vi.spyOn(creditsAccessService, 'revokeAccess');

    service.startSession();
    service.resolveBug();

    service.startNewSessionFromCredits();

    const currentSession = sessionService.activeSession();

    expect(revokeAccessSpy).toHaveBeenCalled();
    expect(currentSession).not.toBeNull();
    expect(currentSession?.status).toBe('active');
    expect(chatRuntimeService.state()).toBe('ready');
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('does not restore a resolved session as chat', () => {
    vi.spyOn(sessionPersistenceService, 'readSession').mockReturnValue({
      id: 'resolved-session',
      status: 'resolved',
      startedAt: 1_700_000_000_000,
      updatedAt: 1_700_000_001_000,
      messages: [],
      userMessageCount: 0,
      responseHistory: [],
      messagesSinceLastSleep: 0,
      lastDuckReplyAt: null,
    });

    service.tryRestore();

    expect(sessionService.session()).toBeNull();
    expect(chatRuntimeService.state()).toBe('ready');
  });

  it('restores a pending thinking cycle when the last message is from the user', async () => {
    vi.useFakeTimers();

    const selectReplySpy = vi.spyOn(responseEngineService, 'selectReply');
    const now = 1_700_000_300_000;
    vi.setSystemTime(now);

    vi.spyOn(sessionPersistenceService, 'readSession').mockReturnValue({
      id: 'session-thinking',
      status: 'active',
      startedAt: now - 20_000,
      updatedAt: now - 1_000,
      messages: [
        {
          id: 'duck-opening-thinking',
          author: 'duck',
          text: 'Coin.',
          createdAt: now - 20_000,
          kind: 'opening',
          mood: 'welcoming',
          category: 'opening',
        },
        {
          id: 'user-message-1',
          author: 'user',
          text: 'Mon bug persiste',
          createdAt: now - 1_000,
        },
      ],
      userMessageCount: 1,
      responseHistory: [],
      messagesSinceLastSleep: 1,
      lastDuckReplyAt: now - 20_000,
    });

    service.tryRestore();

    expect(chatRuntimeService.state()).toBe('thinking');

    await vi.advanceTimersByTimeAsync(CHAT_REPLY_DELAY_MS);

    const lastMessage = sessionService.messages().at(-1);
    expectDuckMessage(lastMessage);
    expect(lastMessage.kind).toBe('reply');
    expect(chatRuntimeService.state()).toBe('ready');

    expect(selectReplySpy).toHaveBeenCalledWith({
      message: 'Mon bug persiste',
      userMessageCount: 1,
      responseHistory: [],
      shouldAddWakeupPrefix: false,
    });
  });

  it('restores a pending thinking cycle with wakeup prefix when the previous message is sleep', async () => {
    vi.useFakeTimers();

    const selectReplySpy = vi.spyOn(responseEngineService, 'selectReply');
    const now = 1_700_000_400_000;
    vi.setSystemTime(now);

    vi.spyOn(sessionPersistenceService, 'readSession').mockReturnValue({
      id: 'session-thinking-after-sleep',
      status: 'active',
      startedAt: now - 20_000,
      updatedAt: now - 1_000,
      messages: [
        {
          id: 'duck-opening-thinking',
          author: 'duck',
          text: 'Coin.',
          createdAt: now - 20_000,
          kind: 'opening',
          mood: 'welcoming',
          category: 'opening',
        },
        {
          id: 'user-message-1',
          author: 'user',
          text: 'Premier message',
          createdAt: now - 18_000,
        },
        {
          id: 'duck-reply-1',
          author: 'duck',
          text: 'Réponse',
          createdAt: now - 17_000,
          kind: 'reply',
          mood: 'curious',
          category: 'general',
        },
        {
          id: 'user-message-2',
          author: 'user',
          text: 'Deuxième message',
          createdAt: now - 16_000,
        },
        {
          id: 'duck-sleep-1',
          author: 'duck',
          text: 'Zzz...',
          createdAt: now - 15_000,
          kind: 'sleep',
          mood: 'sleeping',
          category: 'sleep',
        },
        {
          id: 'user-message-3',
          author: 'user',
          text: 'Réveille-toi',
          createdAt: now - 1_000,
        },
      ],
      userMessageCount: 3,
      responseHistory: [],
      messagesSinceLastSleep: 1,
      lastDuckReplyAt: now - 17_000,
    });

    service.tryRestore();

    expect(chatRuntimeService.state()).toBe('thinking');

    await vi.advanceTimersByTimeAsync(CHAT_REPLY_DELAY_MS);

    expect(selectReplySpy).toHaveBeenCalledWith({
      message: 'Réveille-toi',
      userMessageCount: 3,
      responseHistory: [],
      shouldAddWakeupPrefix: true,
    });
  });
});
