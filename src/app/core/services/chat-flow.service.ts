import { inject, Injectable } from '@angular/core';

import { CHAT_REPLY_DELAY_MS } from '../../config/business-rules';
import { type DuckContentEntry } from '../../content';
import { type DuckSession } from '../../models';
import { ChatRuntimeService } from './chat-runtime.service';
import { ResponseCatalogService } from './response-catalog.service';
import { ResponseEngineService, type ResponseEngineResult } from './response-engine.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class ChatFlowService {
  private readonly sessionService = inject(SessionService);
  private readonly chatRuntimeService = inject(ChatRuntimeService);
  private readonly responseCatalogService = inject(ResponseCatalogService);
  private readonly responseEngineService = inject(ResponseEngineService);

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

    const userMessageCreatedAt = Date.now();

    this.sessionService.addMessage({
      id: this.generateUserMessageId(userMessageCreatedAt),
      author: 'user',
      text: trimmedMessage,
      createdAt: userMessageCreatedAt,
    });

    this.chatRuntimeService.setThinking();

    globalThis.setTimeout(() => {
      const currentSession = this.sessionService.activeSession();

      if (!currentSession) {
        this.chatRuntimeService.setReady();
        return;
      }

      const reply = this.responseEngineService.selectReply({
        message: trimmedMessage,
        userMessageCount: currentSession.userMessageCount,
        responseHistory: currentSession.responseHistory,
      });

      this.appendDuckReply(reply);
      this.sessionService.pushResponseHistory(reply.entry.id, Date.now());
      this.chatRuntimeService.setReady();
    }, CHAT_REPLY_DELAY_MS);
  }

  resolveBug(): void {
    throw new Error('ChatFlowService.resolveBug() is not implemented yet.');
  }

  startNewSession(): void {
    throw new Error('ChatFlowService.startNewSession() is not implemented yet.');
  }

  tryRestore(): void {
    throw new Error('ChatFlowService.tryRestore() is not implemented yet.');
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

  private pickOpeningMessage(): DuckContentEntry {
    const openings = this.responseCatalogService.openings;
    const randomIndex = Math.floor(Math.random() * openings.length);

    return openings[randomIndex];
  }

  private generateSessionId(timestamp: number): string {
    return `session-${timestamp}`;
  }

  private generateUserMessageId(timestamp: number): string {
    return `user-message-${timestamp}`;
  }

  private generateDuckMessageId(kind: 'opening' | 'reply', timestamp: number): string {
    return `duck-${kind}-${timestamp}`;
  }
}
