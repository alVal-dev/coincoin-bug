import { inject, Injectable } from '@angular/core';

import { type DuckContentEntry, type KeywordMatcherGroup } from '../../content';
import { type KeywordCategory, type ReplyPoolCategory } from '../../models';
import { RANDOM_SOURCE } from '../tokens/random-source.token';
import { ResponseCatalogService } from './response-catalog.service';

export interface ResponseEngineInput {
  message: string;
  userMessageCount: number;
  responseHistory: readonly string[];
  shouldAddWakeupPrefix?: boolean;
}

export interface ResponseEngineResult {
  entry: DuckContentEntry;
  text: string;
  category: ReplyPoolCategory;
  usedWakeupPrefix: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ResponseEngineService {
  private readonly responseCatalogService = inject(ResponseCatalogService);
  private readonly randomSource = inject(RANDOM_SOURCE);

  selectReply(input: ResponseEngineInput): ResponseEngineResult {
    const normalizedMessage = this.normalize(input.message);
    const wakeupPrefix = input.shouldAddWakeupPrefix ? this.pickWakeupPrefix() : null;

    const easterEggEntry = this.pickEasterEggOverride(normalizedMessage, input.responseHistory);
    if (easterEggEntry) {
      return this.buildResult(easterEggEntry, wakeupPrefix);
    }

    const detectedCategory = this.detectCategory(normalizedMessage);
    const swearReply = this.pickSwearOverride(
      normalizedMessage,
      detectedCategory,
      input.responseHistory,
    );

    if (swearReply) {
      return this.buildResult(swearReply, wakeupPrefix);
    }

    const shortReply = this.pickShortMessageOverride(normalizedMessage, input.responseHistory);
    if (shortReply) {
      return this.buildResult(shortReply, wakeupPrefix);
    }

    const longReply = this.pickLongMessageOverride(normalizedMessage, input.responseHistory);
    if (longReply) {
      return this.buildResult(longReply, wakeupPrefix);
    }

    const poolCategory = this.selectReplyPoolCategory(detectedCategory, input.userMessageCount);
    const pool = this.responseCatalogService.replyCatalog[poolCategory];
    const entry = this.pickEntryWithAntiRepetition(pool, input.responseHistory);

    return this.buildResult(entry, wakeupPrefix);
  }

  normalize(message: string): string {
    return message
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  detectCategory(normalizedMessage: string): KeywordCategory {
    const dictionary = this.responseCatalogService.technicalKeywords;
    const tokens = normalizedMessage.length > 0 ? normalizedMessage.split(' ') : [];

    const categoriesInPriorityOrder: readonly KeywordCategory[] = [
      'git',
      'api',
      'runtime',
      'css',
      'prod',
    ];

    for (const category of categoriesInPriorityOrder) {
      if (this.matchesCategory(dictionary[category], tokens, normalizedMessage)) {
        return category;
      }
    }

    return 'general';
  }

  private matchesCategory(
    matcherGroup: KeywordMatcherGroup,
    tokens: readonly string[],
    normalizedMessage: string,
  ): boolean {
    const tokenSet = new Set(tokens);

    if (matcherGroup.tokens.some((token) => tokenSet.has(token))) {
      return true;
    }

    return matcherGroup.phrases.some((phrase) => normalizedMessage.includes(phrase));
  }

  private pickEasterEggOverride(
    normalizedMessage: string,
    responseHistory: readonly string[],
  ): DuckContentEntry | null {
    const easterEggTriggers = [
      'rubber duck',
      'coin coin',
      'tmpfinalv2',
      'cache invalide',
      'yak shave',
      'works on my machine',
    ];

    const hasEasterEggTrigger = easterEggTriggers.some((trigger) =>
      normalizedMessage.includes(trigger),
    );

    if (!hasEasterEggTrigger) {
      return null;
    }

    return this.pickEntryWithAntiRepetition(
      this.responseCatalogService.easterEggReplies,
      responseHistory,
    );
  }

  private pickSwearOverride(
    normalizedMessage: string,
    detectedCategory: KeywordCategory,
    responseHistory: readonly string[],
  ): DuckContentEntry | null {
    if (detectedCategory !== 'general') {
      return null;
    }

    const tokens = normalizedMessage.length > 0 ? normalizedMessage.split(' ') : [];
    const tokenSet = new Set(tokens);

    const hasSwearToken = this.responseCatalogService.swearWordTokens.some((token) =>
      tokenSet.has(token),
    );
    const hasSwearPhrase = this.responseCatalogService.swearWordPhrases.some((phrase) =>
      normalizedMessage.includes(phrase),
    );

    if (!hasSwearToken && !hasSwearPhrase) {
      return null;
    }

    return this.pickEntryWithAntiRepetition(
      this.responseCatalogService.swearReplies,
      responseHistory,
    );
  }

  private pickShortMessageOverride(
    normalizedMessage: string,
    responseHistory: readonly string[],
  ): DuckContentEntry | null {
    const tokenCount = normalizedMessage.length === 0 ? 0 : normalizedMessage.split(' ').length;

    if (tokenCount === 0 || tokenCount > 3) {
      return null;
    }

    return this.pickEntryWithAntiRepetition(
      this.responseCatalogService.shortMessageReplies,
      responseHistory,
    );
  }

  private pickLongMessageOverride(
    normalizedMessage: string,
    responseHistory: readonly string[],
  ): DuckContentEntry | null {
    const tokenCount = normalizedMessage.length === 0 ? 0 : normalizedMessage.split(' ').length;

    if (tokenCount < 25) {
      return null;
    }

    return this.pickEntryWithAntiRepetition(
      this.responseCatalogService.longMessageReplies,
      responseHistory,
    );
  }

  private selectReplyPoolCategory(
    detectedCategory: KeywordCategory,
    userMessageCount: number,
  ): ReplyPoolCategory {
    if (userMessageCount >= 4 && userMessageCount <= 5) {
      return 'empathic';
    }

    if (userMessageCount >= 6) {
      return this.pickOne([detectedCategory, 'empathic', 'absurd', 'offtopic'] as const);
    }

    if (userMessageCount >= 2 && userMessageCount <= 3) {
      return this.pickOne([detectedCategory, 'absurd', 'offtopic'] as const);
    }

    return detectedCategory;
  }

  private pickWakeupPrefix(): string | null {
    const prefixes = this.responseCatalogService.wakeupPrefixes;

    if (prefixes.length === 0) {
      return null;
    }

    return this.pickOne(prefixes).text;
  }

  private pickEntryWithAntiRepetition(
    entries: readonly DuckContentEntry[],
    responseHistory: readonly string[],
  ): DuckContentEntry {
    const unusedEntries = entries.filter((entry) => !responseHistory.includes(entry.id));
    const selectionPool = unusedEntries.length > 0 ? unusedEntries : entries;

    return this.pickOne(selectionPool);
  }

  private buildResult(entry: DuckContentEntry, wakeupPrefix: string | null): ResponseEngineResult {
    const text = wakeupPrefix ? `${wakeupPrefix} ${entry.text}` : entry.text;

    return {
      entry,
      text,
      category: this.toReplyPoolCategory(entry.category),
      usedWakeupPrefix: wakeupPrefix !== null,
    };
  }

  private toReplyPoolCategory(category: DuckContentEntry['category']): ReplyPoolCategory {
    switch (category) {
      case 'git':
      case 'api':
      case 'runtime':
      case 'css':
      case 'prod':
      case 'general':
      case 'empathic':
      case 'absurd':
      case 'offtopic':
        return category;
      default:
        return 'general';
    }
  }

  private pickOne<T>(entries: readonly T[]): T {
    const index = Math.floor(this.randomSource() * entries.length);
    return entries[index];
  }
}
