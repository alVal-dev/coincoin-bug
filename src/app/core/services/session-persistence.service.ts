import { inject, Injectable } from '@angular/core';

import {
  CHAT_MESSAGE_AUTHORS,
  DUCK_MESSAGE_CATEGORIES,
  DUCK_MESSAGE_KINDS,
  DUCK_MOODS,
  SESSION_STATUSES,
  SESSION_STORAGE_VERSION,
  STORAGE_KEYS,
  type ChatMessage,
  type DuckChatMessage,
  type DuckSession,
  type PersistedDuckSession,
  type UserChatMessage,
} from '../../models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class SessionPersistenceService {
  readonly storageService = inject(StorageService);

  readSession(): DuckSession | null {
    const rawValue = this.storageService.getItem(STORAGE_KEYS.session);

    if (rawValue === null) {
      return null;
    }

    let parsedValue: unknown;

    try {
      parsedValue = JSON.parse(rawValue);
    } catch {
      this.clearSession();
      return null;
    }

    if (!this.isPersistedDuckSession(parsedValue)) {
      this.clearSession();
      return null;
    }

    return parsedValue.session;
  }

  writeSession(session: DuckSession): boolean {
    const payload: PersistedDuckSession = {
      version: SESSION_STORAGE_VERSION,
      session,
    };

    return this.storageService.setItem(STORAGE_KEYS.session, JSON.stringify(payload));
  }

  clearSession(): boolean {
    return this.storageService.removeItem(STORAGE_KEYS.session);
  }

  private isPersistedDuckSession(value: unknown): value is PersistedDuckSession {
    if (!this.isRecord(value)) {
      return false;
    }

    if (value['version'] !== SESSION_STORAGE_VERSION) {
      return false;
    }

    return this.isDuckSession(value['session']);
  }

  private isDuckSession(value: unknown): value is DuckSession {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value['id'] === 'string' &&
      this.isOneOf(value['status'], SESSION_STATUSES) &&
      typeof value['startedAt'] === 'number' &&
      typeof value['updatedAt'] === 'number' &&
      Array.isArray(value['messages']) &&
      value['messages'].every((message) => this.isChatMessage(message)) &&
      typeof value['userMessageCount'] === 'number' &&
      this.isStringArray(value['responseHistory']) &&
      typeof value['messagesSinceLastSleep'] === 'number' &&
      (typeof value['lastDuckReplyAt'] === 'number' || value['lastDuckReplyAt'] === null)
    );
  }

  private isChatMessage(value: unknown): value is ChatMessage {
    if (!this.isRecord(value)) {
      return false;
    }

    if (!this.isOneOf(value['author'], CHAT_MESSAGE_AUTHORS)) {
      return false;
    }

    if (
      typeof value['id'] !== 'string' ||
      typeof value['text'] !== 'string' ||
      typeof value['createdAt'] !== 'number'
    ) {
      return false;
    }

    if (value['author'] === 'user') {
      return this.isUserChatMessage(value);
    }

    return this.isDuckChatMessage(value);
  }

  private isUserChatMessage(value: unknown): value is UserChatMessage {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      value['author'] === 'user' &&
      typeof value['id'] === 'string' &&
      typeof value['text'] === 'string' &&
      typeof value['createdAt'] === 'number'
    );
  }

  private isDuckChatMessage(value: unknown): value is DuckChatMessage {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      value['author'] === 'duck' &&
      typeof value['id'] === 'string' &&
      typeof value['text'] === 'string' &&
      typeof value['createdAt'] === 'number' &&
      this.isOneOf(value['kind'], DUCK_MESSAGE_KINDS) &&
      this.isOneOf(value['mood'], DUCK_MOODS) &&
      this.isOneOf(value['category'], DUCK_MESSAGE_CATEGORIES)
    );
  }

  private isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isOneOf<const T extends readonly string[]>(
    value: unknown,
    allowedValues: T,
  ): value is T[number] {
    return typeof value === 'string' && allowedValues.includes(value);
  }
}
