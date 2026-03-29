import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CHAT_REPLY_DELAY_MS, SLEEP_DELAY_MS } from '../../config/business-rules';
import { type ChatMessage, type DuckChatMessage } from '../../models';
import { ChatRuntimeService } from './chat-runtime.service';
import { ChatFlowService } from './chat-flow.service';
import { ResponseCatalogService } from './response-catalog.service';
import { ResponseEngineService } from './response-engine.service';
import { SessionPersistenceService } from './session-persistence.service';
import { SessionService } from './session.service';

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    service = TestBed.inject(ChatFlowService);
    sessionService = TestBed.inject(SessionService);
    chatRuntimeService = TestBed.inject(ChatRuntimeService);
    responseCatalogService = TestBed.inject(ResponseCatalogService);
    responseEngineService = TestBed.inject(ResponseEngineService);
    sessionPersistenceService = TestBed.inject(SessionPersistenceService);

    sessionService.clearSession();
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

  it('still exposes stable explicit not-yet-implemented methods for resolveBug and startNewSession', () => {
    expect(() => service.resolveBug()).toThrowError(
      'ChatFlowService.resolveBug() is not implemented yet.',
    );
    expect(() => service.startNewSession()).toThrowError(
      'ChatFlowService.startNewSession() is not implemented yet.',
    );
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

    await vi.advanceTimersByTimeAsync(SLEEP_DELAY_MS + 100);

    const sleepMessages = sessionService
      .messages()
      .filter((message) => message.author === 'duck' && message.kind === 'sleep');

    expect(sleepMessages).toHaveLength(1);
  });
});
