import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatRuntimeService } from './chat-runtime.service';
import { ChatFlowService } from './chat-flow.service';
import { ResponseCatalogService } from './response-catalog.service';
import { SessionService } from './session.service';

describe('ChatFlowService', () => {
  let service: ChatFlowService;
  let sessionService: SessionService;
  let chatRuntimeService: ChatRuntimeService;
  let responseCatalogService: ResponseCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    service = TestBed.inject(ChatFlowService);
    sessionService = TestBed.inject(SessionService);
    chatRuntimeService = TestBed.inject(ChatRuntimeService);
    responseCatalogService = TestBed.inject(ResponseCatalogService);

    sessionService.clearSession();
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

  it('exposes stable not-yet-implemented methods explicitly', () => {
    expect(() => service.resolveBug()).toThrowError(
      'ChatFlowService.resolveBug() is not implemented yet.',
    );
    expect(() => service.startNewSession()).toThrowError(
      'ChatFlowService.startNewSession() is not implemented yet.',
    );
    expect(() => service.tryRestore()).toThrowError(
      'ChatFlowService.tryRestore() is not implemented yet.',
    );
  });
});
