import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { STORAGE_KEYS, type DuckSession } from '../../models';
import { SessionPersistenceService } from './session-persistence.service';
import { StorageService } from './storage.service';

describe('SessionPersistenceService', () => {
  let service: SessionPersistenceService;
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    sessionStorage.clear();

    service = TestBed.inject(SessionPersistenceService);
    storageService = TestBed.inject(StorageService);
  });

  it('reads a valid persisted session', () => {
    const session = createSession();

    storageService.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({
        version: 1,
        session,
      }),
    );

    expect(service.readSession()).toEqual(session);
  });

  it('returns null and clears storage when json is invalid', () => {
    storageService.setItem(STORAGE_KEYS.session, '{invalid-json');

    expect(service.readSession()).toBeNull();
    expect(storageService.getItem(STORAGE_KEYS.session)).toBeNull();
  });

  it('returns null and clears storage when version is invalid', () => {
    storageService.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({
        version: 999,
        session: createSession(),
      }),
    );

    expect(service.readSession()).toBeNull();
    expect(storageService.getItem(STORAGE_KEYS.session)).toBeNull();
  });

  it('returns null and clears storage when session shape is invalid', () => {
    storageService.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({
        version: 1,
        session: {
          id: 'broken-session',
        },
      }),
    );

    expect(service.readSession()).toBeNull();
    expect(storageService.getItem(STORAGE_KEYS.session)).toBeNull();
  });

  it('writes a session using the versioned payload contract', () => {
    const session = createSession();

    expect(service.writeSession(session)).toBe(true);

    expect(JSON.parse(storageService.getItem(STORAGE_KEYS.session) ?? 'null')).toEqual({
      version: 1,
      session,
    });
  });

  it('clears the persisted session', () => {
    storageService.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({
        version: 1,
        session: createSession(),
      }),
    );

    expect(service.clearSession()).toBe(true);
    expect(storageService.getItem(STORAGE_KEYS.session)).toBeNull();
  });

  function createSession(): DuckSession {
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
    };
  }
});
