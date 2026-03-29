import { inject, Injectable } from '@angular/core';

import { type DuckContentEntry } from '../../content';
import { type DuckSession } from '../../models';
import { ChatRuntimeService } from './chat-runtime.service';
import { ResponseCatalogService } from './response-catalog.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class ChatFlowService {
  private readonly sessionService = inject(SessionService);
  private readonly chatRuntimeService = inject(ChatRuntimeService);
  private readonly responseCatalogService = inject(ResponseCatalogService);

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
          id: this.generateDuckMessageId(now),
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

  sendMessage(): void {
    throw new Error('ChatFlowService.sendMessage() is not implemented yet.');
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

  private pickOpeningMessage(): DuckContentEntry {
    const openings = this.responseCatalogService.openings;
    const randomIndex = Math.floor(Math.random() * openings.length);

    return openings[randomIndex];
  }

  private generateSessionId(timestamp: number): string {
    return `session-${timestamp}`;
  }

  private generateDuckMessageId(timestamp: number): string {
    return `duck-opening-${timestamp}`;
  }
}
