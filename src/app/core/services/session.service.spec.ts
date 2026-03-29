import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type DuckSession } from '../../models';
import { SessionPersistenceService } from './session-persistence.service';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;
  let sessionPersistenceService: SessionPersistenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    service = TestBed.inject(SessionService);
    sessionPersistenceService = TestBed.inject(SessionPersistenceService);

    vi.spyOn(sessionPersistenceService, 'writeSession').mockReturnValue(true);
    vi.spyOn(sessionPersistenceService, 'clearSession').mockReturnValue(true);
  });

  it('creates a session and persists it explicitly', () => {
    const session = createSession();
    const writeSpy = vi.spyOn(sessionPersistenceService, 'writeSession');

    service.createSession(session);

    expect(service.session()).toEqual(session);
    expect(service.activeSession()).toEqual(session);
    expect(service.hasActiveSession()).toBe(true);
    expect(writeSpy).toHaveBeenCalledWith(session);
  });

  it('restores a resolved session and exposes it through computed state', () => {
    const session = createSession({ status: 'resolved' });
    const writeSpy = vi.spyOn(sessionPersistenceService, 'writeSession');

    service.restoreSession(session);

    expect(service.session()).toEqual(session);
    expect(service.resolvedSession()).toEqual(session);
    expect(service.hasResolvedSession()).toBe(true);
    expect(service.activeSession()).toBeNull();
    expect(writeSpy).toHaveBeenCalledWith(session);
  });

  it('adds a user message and updates counters', () => {
    service.createSession(createSession());

    service.addMessage({
      id: 'message-user-002',
      author: 'user',
      text: 'Ça casse encore',
      createdAt: 1_700_000_000_800,
    });

    expect(service.messages()).toHaveLength(3);
    expect(service.userMessageCount()).toBe(2);
    expect(service.messagesSinceLastSleep()).toBe(2);
    expect(service.lastDuckReplyAt()).toBe(1_700_000_000_500);
  });

  it('adds a duck reply and updates lastDuckReplyAt', () => {
    service.createSession(createSession());

    service.addMessage({
      id: 'message-duck-002',
      author: 'duck',
      text: 'Je prends ça très personnellement.',
      createdAt: 1_700_000_001_000,
      kind: 'reply',
      mood: 'sarcastic',
      category: 'general',
    });

    expect(service.messages()).toHaveLength(3);
    expect(service.userMessageCount()).toBe(1);
    expect(service.messagesSinceLastSleep()).toBe(1);
    expect(service.lastDuckReplyAt()).toBe(1_700_000_001_000);
  });

  it('does not update lastDuckReplyAt for a sleep message', () => {
    service.createSession(createSession());

    service.addMessage({
      id: 'message-duck-sleep-001',
      author: 'duck',
      text: '...coin...',
      createdAt: 1_700_000_001_000,
      kind: 'sleep',
      mood: 'sleeping',
      category: 'sleep',
    });

    expect(service.lastDuckReplyAt()).toBe(1_700_000_000_500);
  });

  it('marks the session as resolved', () => {
    service.createSession(createSession());

    service.markResolved(1_700_000_001_200);

    expect(service.session()?.status).toBe('resolved');
    expect(service.hasResolvedSession()).toBe(true);
    expect(service.hasActiveSession()).toBe(false);
  });

  it('clears the current session and persisted storage', () => {
    const clearSpy = vi.spyOn(sessionPersistenceService, 'clearSession');

    service.createSession(createSession());
    service.clearSession();

    expect(service.session()).toBeNull();
    expect(service.activeSession()).toBeNull();
    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it('bounds the response history size', () => {
    service.createSession(createSession({ responseHistory: [] }));

    for (let index = 1; index <= 20; index += 1) {
      service.pushResponseHistory(`reply-${index}`, 1_700_000_001_000 + index);
    }

    expect(service.responseHistory()).toHaveLength(12);
    expect(service.responseHistory()[0]).toBe('reply-9');
    expect(service.responseHistory()[11]).toBe('reply-20');
  });

  it('resets messagesSinceLastSleep explicitly', () => {
    service.createSession(createSession({ messagesSinceLastSleep: 4 }));

    service.resetMessagesSinceLastSleep(1_700_000_001_500);

    expect(service.messagesSinceLastSleep()).toBe(0);
  });

  function createSession(overrides: Partial<DuckSession> = {}): DuckSession {
    return {
      id: 'session-001',
      status: 'active',
      startedAt: 1_700_000_000_000,
      updatedAt: 1_700_000_000_500,
      messages: [
        {
          id: 'message-user-001',
          author: 'user',
          text: 'Mon bug est bizarre',
          createdAt: 1_700_000_000_100,
        },
        {
          id: 'message-duck-001',
          author: 'duck',
          text: 'Je compatis vaguement.',
          createdAt: 1_700_000_000_500,
          kind: 'reply',
          mood: 'empathetic',
          category: 'empathic',
        },
      ],
      userMessageCount: 1,
      responseHistory: ['general-001'],
      messagesSinceLastSleep: 1,
      lastDuckReplyAt: 1_700_000_000_500,
      ...overrides,
    };
  }
});
