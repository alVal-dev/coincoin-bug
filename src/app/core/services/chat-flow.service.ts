import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {
  CHAT_REPLY_DELAY_MS,
  MIN_USER_MESSAGES_BEFORE_SLEEP,
  USER_MESSAGES_SLEEP_COOLDOWN,
} from '../../config/business-rules';
import { type DuckContentEntry } from '../../content';
import { type DuckSession } from '../../models';
import { ChatRuntimeService } from './chat-runtime.service';
import { CreditsAccessService } from './credits-access.service';
import { ResponseCatalogService } from './response-catalog.service';
import { ResponseEngineService, type ResponseEngineResult } from './response-engine.service';
import { SessionPersistenceService } from './session-persistence.service';
import { SessionService } from './session.service';
import { ConfettiService } from './confetti.service';

@Injectable({
  providedIn: 'root',
})
export class ChatFlowService {
  private readonly sessionService = inject(SessionService);
  private readonly chatRuntimeService = inject(ChatRuntimeService);
  private readonly responseCatalogService = inject(ResponseCatalogService);
  private readonly responseEngineService = inject(ResponseEngineService);
  private readonly sessionPersistenceService = inject(SessionPersistenceService);
  private readonly creditsAccessService = inject(CreditsAccessService);
  private readonly router = inject(Router);
  private readonly confettiService = inject(ConfettiService);

  startSession(): void {
    const now = Date.now();
    const opening = this.pickOpeningMessage();

    const session: DuckSession = {
      id: this.generateSessionId(now),
      status: 'active',
      startedAt: now,
      updatedAt: now,
      messages: [
        {
          id: this.generateDuckMessageId('opening', now),
          author: 'duck',
          text: opening.text,
          createdAt: now,
          kind: 'opening',
          mood: opening.mood,
          category: opening.category,
        },
      ],
      userMessageCount: 0,
      responseHistory: [],
      messagesSinceLastSleep: 0,
      lastDuckReplyAt: now,
    };

    this.sessionService.createSession(session);
    this.chatRuntimeService.setReady();
    this.armSleepTimerIfEligible();
  }

  sendMessage(message: string): void {
    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      return;
    }

    const activeSession = this.sessionService.activeSession();
    if (!activeSession) {
      return;
    }

    this.chatRuntimeService.clearSleepTimer();

    const shouldAddWakeupPrefix = this.shouldAddWakeupPrefix(activeSession);
    const userMessageCreatedAt = Date.now();

    this.sessionService.addMessage({
      id: this.generateUserMessageId(userMessageCreatedAt),
      author: 'user',
      text: trimmedMessage,
      createdAt: userMessageCreatedAt,
    });

    this.scheduleDuckReply({
      message: trimmedMessage,
      shouldAddWakeupPrefix,
    });
  }

  resolveBug(): void {
    const activeSession = this.sessionService.activeSession();

    if (!activeSession) {
      return;
    }

    this.chatRuntimeService.clearSleepTimer();

    const resolution = this.pickResolutionMessage();
    const resolvedAt = Date.now();

    this.sessionService.addMessage({
      id: this.generateDuckMessageId('resolution', resolvedAt),
      author: 'duck',
      text: resolution.text,
      createdAt: resolvedAt,
      kind: 'resolution',
      mood: resolution.mood,
      category: resolution.category,
    });

    this.sessionService.markResolved(resolvedAt);
    this.creditsAccessService.grantAccess();
    this.chatRuntimeService.setCelebrating();
    this.confettiService.celebrate();

    void this.router.navigate(['/credits']);
  }

  startNewSession(): void {
    this.chatRuntimeService.clearSleepTimer();
    this.sessionService.clearSession();
    this.startSession();
  }

  startNewSessionFromCredits(): void {
    this.chatRuntimeService.clearSleepTimer();
    this.sessionService.clearSession();
    this.creditsAccessService.revokeAccess();
    this.startSession();

    void this.router.navigate(['/']);
  }

  tryRestore(): void {
    const restoredSession = this.sessionPersistenceService.readSession();

    if (!restoredSession) {
      return;
    }

    if (restoredSession.status === 'resolved') {
      this.sessionService.clearSession();
      this.chatRuntimeService.clearSleepTimer();
      this.chatRuntimeService.setReady();
      return;
    }

    this.sessionService.restoreSession(restoredSession);

    const lastMessage = this.getLastMessage(restoredSession);

    if (!lastMessage) {
      this.chatRuntimeService.setReady();
      return;
    }

    if (lastMessage.author === 'user') {
      const shouldAddWakeupPrefix =
        this.shouldAddWakeupPrefixBeforePendingUserMessage(restoredSession);

      this.scheduleDuckReply({
        message: lastMessage.text,
        shouldAddWakeupPrefix,
      });

      return;
    }

    if (lastMessage.kind === 'sleep') {
      this.chatRuntimeService.setSleeping();
      this.chatRuntimeService.clearSleepTimer();
      return;
    }

    this.chatRuntimeService.setReady();
    this.recalculateSleepTimerIfEligible();
  }

  private scheduleDuckReply(input: { message: string; shouldAddWakeupPrefix: boolean }): void {
    this.chatRuntimeService.setThinking();

    globalThis.setTimeout(() => {
      const currentSession = this.sessionService.activeSession();

      if (!currentSession) {
        this.chatRuntimeService.setReady();
        return;
      }

      const reply = this.responseEngineService.selectReply({
        message: input.message,
        userMessageCount: currentSession.userMessageCount,
        responseHistory: currentSession.responseHistory,
        shouldAddWakeupPrefix: input.shouldAddWakeupPrefix,
      });

      this.appendDuckReply(reply);
      this.sessionService.pushResponseHistory(reply.entry.id, Date.now());
      this.chatRuntimeService.setReady();
      this.armSleepTimerIfEligible();
    }, CHAT_REPLY_DELAY_MS);
  }

  private appendDuckReply(reply: ResponseEngineResult): void {
    const replyCreatedAt = Date.now();

    this.sessionService.addMessage({
      id: this.generateDuckMessageId('reply', replyCreatedAt),
      author: 'duck',
      text: reply.text,
      createdAt: replyCreatedAt,
      kind: 'reply',
      mood: reply.entry.mood,
      category: reply.entry.category,
    });
  }

  private appendSleepMessage(): void {
    const sleepEntry = this.pickSleepMessage();
    const sleepCreatedAt = Date.now();

    this.sessionService.addMessage({
      id: this.generateDuckMessageId('sleep', sleepCreatedAt),
      author: 'duck',
      text: sleepEntry.text,
      createdAt: sleepCreatedAt,
      kind: 'sleep',
      mood: sleepEntry.mood,
      category: sleepEntry.category,
    });

    this.sessionService.resetMessagesSinceLastSleep(sleepCreatedAt);
    this.chatRuntimeService.setSleeping();
  }

  private armSleepTimerIfEligible(): void {
    const activeSession = this.sessionService.activeSession();

    if (!this.canArmSleepTimerAfterDuckReply(activeSession)) {
      this.chatRuntimeService.clearSleepTimer();
      return;
    }

    this.chatRuntimeService.startSleepTimer(() => {
      this.handleSleepTimerElapsed();
    });
  }

  private recalculateSleepTimerIfEligible(): void {
    const activeSession = this.sessionService.activeSession();

    if (!this.canRecalculateSleepTimerOnRestore(activeSession)) {
      this.chatRuntimeService.clearSleepTimer();
      return;
    }

    const { lastDuckReplyAt } = activeSession;

    if (lastDuckReplyAt === null) {
      this.chatRuntimeService.clearSleepTimer();
      return;
    }

    this.chatRuntimeService.recalculateSleepTimer(lastDuckReplyAt, () => {
      this.handleSleepTimerElapsed();
    });
  }

  private handleSleepTimerElapsed(): void {
    const activeSession = this.sessionService.activeSession();

    if (!activeSession) {
      return;
    }

    if (this.chatRuntimeService.isThinking()) {
      return;
    }

    if (!this.canSleepNow(activeSession)) {
      return;
    }

    this.appendSleepMessage();
  }

  private canArmSleepTimerAfterDuckReply(session: DuckSession | null): session is DuckSession {
    if (!session || session.status !== 'active') {
      return false;
    }

    const lastMessage = this.getLastMessage(session);

    if (!lastMessage || lastMessage.author !== 'duck') {
      return false;
    }

    return lastMessage.kind === 'opening' || lastMessage.kind === 'reply';
  }

  private canRecalculateSleepTimerOnRestore(session: DuckSession | null): session is DuckSession {
    if (!session || session.status !== 'active') {
      return false;
    }

    if (session.lastDuckReplyAt === null) {
      return false;
    }

    const lastMessage = this.getLastMessage(session);

    if (!lastMessage) {
      return false;
    }

    return (
      lastMessage.author === 'duck' &&
      (lastMessage.kind === 'opening' || lastMessage.kind === 'reply')
    );
  }

  private canSleepNow(session: DuckSession): boolean {
    if (session.userMessageCount < MIN_USER_MESSAGES_BEFORE_SLEEP) {
      return false;
    }

    if (session.messagesSinceLastSleep < USER_MESSAGES_SLEEP_COOLDOWN) {
      return false;
    }

    const lastMessage = this.getLastMessage(session);

    if (!lastMessage || lastMessage.author !== 'duck') {
      return false;
    }

    return lastMessage.kind !== 'sleep';
  }

  private shouldAddWakeupPrefix(session: DuckSession): boolean {
    const lastMessage = this.getLastMessage(session);

    return lastMessage?.author === 'duck' && lastMessage.kind === 'sleep';
  }

  private shouldAddWakeupPrefixBeforePendingUserMessage(session: DuckSession): boolean {
    const previousMessage = session.messages.at(-2);

    return previousMessage?.author === 'duck' && previousMessage.kind === 'sleep';
  }

  private getLastMessage(session: DuckSession): DuckSession['messages'][number] | undefined {
    return session.messages.at(-1);
  }

  private pickOpeningMessage(): DuckContentEntry {
    const openings = this.responseCatalogService.openings;
    const randomIndex = Math.floor(Math.random() * openings.length);

    return openings[randomIndex];
  }

  private pickSleepMessage(): DuckContentEntry {
    const sleepMessages = this.responseCatalogService.sleepMessages;
    const randomIndex = Math.floor(Math.random() * sleepMessages.length);

    return sleepMessages[randomIndex];
  }

  private pickResolutionMessage(): DuckContentEntry {
    const resolutionMessages = this.responseCatalogService.resolutionMessages;
    const randomIndex = Math.floor(Math.random() * resolutionMessages.length);

    return resolutionMessages[randomIndex];
  }

  private generateSessionId(timestamp: number): string {
    return `session-${timestamp}`;
  }

  private generateUserMessageId(timestamp: number): string {
    return `user-message-${timestamp}`;
  }

  private generateDuckMessageId(
    kind: 'opening' | 'reply' | 'sleep' | 'resolution',
    timestamp: number,
  ): string {
    return `duck-${kind}-${timestamp}`;
  }
}
