import { Injectable, computed, inject, signal } from '@angular/core';

import { RESPONSE_HISTORY_LIMIT } from '../../config/business-rules';
import { type ChatMessage, type DuckSession } from '../../models';
import { SessionPersistenceService } from './session-persistence.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly sessionSignal = signal<DuckSession | null>(null);

  readonly session = this.sessionSignal.asReadonly();

  readonly activeSession = computed(() => {
    const session = this.sessionSignal();
    return session?.status === 'active' ? session : null;
  });

  readonly resolvedSession = computed(() => {
    const session = this.sessionSignal();
    return session?.status === 'resolved' ? session : null;
  });

  readonly hasActiveSession = computed(() => this.activeSession() !== null);
  readonly hasResolvedSession = computed(() => this.resolvedSession() !== null);

  readonly messages = computed(() => this.sessionSignal()?.messages ?? []);
  readonly userMessageCount = computed(() => this.sessionSignal()?.userMessageCount ?? 0);
  readonly responseHistory = computed(() => this.sessionSignal()?.responseHistory ?? []);
  readonly messagesSinceLastSleep = computed(
    () => this.sessionSignal()?.messagesSinceLastSleep ?? 0,
  );
  readonly lastDuckReplyAt = computed(() => this.sessionSignal()?.lastDuckReplyAt ?? null);

  private readonly sessionPersistenceService = inject(SessionPersistenceService);

  createSession(session: DuckSession): void {
    this.sessionSignal.set(session);
    this.persistCurrentSession();
  }

  restoreSession(session: DuckSession): void {
    this.sessionSignal.set(session);
    this.persistCurrentSession();
  }

  addMessage(message: ChatMessage): void {
    const currentSession = this.sessionSignal();

    if (!currentSession) {
      return;
    }

    const nextMessages = [...currentSession.messages, message];
    const nextUserMessageCount =
      message.author === 'user'
        ? currentSession.userMessageCount + 1
        : currentSession.userMessageCount;
    const nextMessagesSinceLastSleep =
      message.author === 'user'
        ? currentSession.messagesSinceLastSleep + 1
        : currentSession.messagesSinceLastSleep;
    const nextLastDuckReplyAt =
      message.author === 'duck' && message.kind !== 'sleep'
        ? message.createdAt
        : currentSession.lastDuckReplyAt;

    this.sessionSignal.set({
      ...currentSession,
      messages: nextMessages,
      userMessageCount: nextUserMessageCount,
      messagesSinceLastSleep: nextMessagesSinceLastSleep,
      lastDuckReplyAt: nextLastDuckReplyAt,
      updatedAt: message.createdAt,
    });

    this.persistCurrentSession();
  }

  markResolved(resolvedAt: number): void {
    const currentSession = this.sessionSignal();

    if (!currentSession) {
      return;
    }

    this.sessionSignal.set({
      ...currentSession,
      status: 'resolved',
      updatedAt: resolvedAt,
    });

    this.persistCurrentSession();
  }

  setResponseHistory(history: readonly string[]): void {
    const currentSession = this.sessionSignal();

    if (!currentSession) {
      return;
    }

    this.sessionSignal.set({
      ...currentSession,
      responseHistory: this.trimResponseHistory(history),
      updatedAt: currentSession.updatedAt,
    });

    this.persistCurrentSession();
  }

  pushResponseHistory(responseId: string, updatedAt: number): void {
    const currentSession = this.sessionSignal();

    if (!currentSession) {
      return;
    }

    const nextHistory = this.trimResponseHistory([...currentSession.responseHistory, responseId]);

    this.sessionSignal.set({
      ...currentSession,
      responseHistory: nextHistory,
      updatedAt,
    });

    this.persistCurrentSession();
  }

  resetMessagesSinceLastSleep(updatedAt: number): void {
    const currentSession = this.sessionSignal();

    if (!currentSession) {
      return;
    }

    this.sessionSignal.set({
      ...currentSession,
      messagesSinceLastSleep: 0,
      updatedAt,
    });

    this.persistCurrentSession();
  }

  clearSession(): void {
    this.sessionSignal.set(null);
    this.sessionPersistenceService.clearSession();
  }

  private persistCurrentSession(): void {
    const currentSession = this.sessionSignal();

    if (!currentSession) {
      return;
    }

    this.sessionPersistenceService.writeSession(currentSession);
  }

  private trimResponseHistory(history: readonly string[]): string[] {
    if (history.length <= RESPONSE_HISTORY_LIMIT) {
      return [...history];
    }

    return history.slice(-RESPONSE_HISTORY_LIMIT);
  }
}
