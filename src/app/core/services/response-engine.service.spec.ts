import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { RANDOM_SOURCE, type RandomSource } from '../tokens/random-source.token';
import { ResponseEngineService } from './response-engine.service';

describe('ResponseEngineService', () => {
  let service: ResponseEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: RANDOM_SOURCE,
          useValue: createDeterministicRandomSource(0),
        },
      ],
    });

    service = TestBed.inject(ResponseEngineService);
  });

  it('normalizes text by lowercasing, trimming, removing accents and punctuation', () => {
    expect(service.normalize('  DéBUG, ÇA   MARCHE ?!  ')).toBe('debug ca marche');
  });

  it('detects git before other categories by priority', () => {
    expect(service.detectCategory('git merge conflict api timeout')).toBe('git');
  });

  it('detects api, runtime, css and prod categories', () => {
    expect(service.detectCategory('graphql endpoint response body')).toBe('api');
    expect(service.detectCategory('undefined is not a function')).toBe('runtime');
    expect(service.detectCategory('flex justify content center')).toBe('css');
    expect(service.detectCategory('incident 500 en prod')).toBe('prod');
  });

  it('falls back to general when no technical signal is detected', () => {
    expect(service.detectCategory('je suis fatigue et perplexe')).toBe('general');
  });

  it('applies the easter egg override first', () => {
    const result = service.selectReply({
      message: 'works on my machine',
      userMessageCount: 1,
      responseHistory: [],
    });

    expect(result.entry.id.startsWith('easter-')).toBe(true);
  });

  it('applies the swear override only when no technical category is detected', () => {
    const swearResult = service.selectReply({
      message: 'bordel',
      userMessageCount: 1,
      responseHistory: [],
    });

    expect(swearResult.entry.id).toBe('swear-001');

    const technicalResult = service.selectReply({
      message: 'bordel git merge branch rebase conflit historique',
      userMessageCount: 1,
      responseHistory: [],
    });

    expect(technicalResult.entry.id).not.toBe('swear-001');
    expect(technicalResult.category).toBe('git');
  });

  it('applies the short message override', () => {
    const result = service.selectReply({
      message: 'help bug',
      userMessageCount: 1,
      responseHistory: [],
    });

    expect(result.entry.id.startsWith('short-')).toBe(true);
  });

  it('applies the long message override', () => {
    const result = service.selectReply({
      message:
        'Mon application casse depuis ce matin quand je lance une requete puis une autre et ensuite tout devient tres etrange avec un comportement instable qui me fait douter de mes choix techniques et personnels',
      userMessageCount: 1,
      responseHistory: [],
    });

    expect(result.entry.id.startsWith('long-')).toBe(true);
  });

  it('uses anti-repetition before recycling the pool', () => {
    const result = service.selectReply({
      message: 'graphql endpoint request response payload serveur distant',
      userMessageCount: 1,
      responseHistory: ['api-001'],
    });

    expect(result.entry.id).toBe('api-002');
  });

  it('recycles the pool when all entries have already been used', () => {
    const result = service.selectReply({
      message: 'graphql endpoint request response payload serveur distant',
      userMessageCount: 1,
      responseHistory: ['api-001', 'api-002', 'api-003', 'api-004', 'api-005'],
    });

    expect(result.entry.id).toBe('api-001');
  });

  it('switches to empathic replies for messages 4 and 5', () => {
    const result = service.selectReply({
      message: 'git merge branch conflit historique repository distant',
      userMessageCount: 4,
      responseHistory: [],
    });

    expect(result.category).toBe('empathic');
  });

  it('adds a wakeup prefix when requested', () => {
    const result = service.selectReply({
      message: 'graphql endpoint request response payload serveur distant',
      userMessageCount: 1,
      responseHistory: [],
      shouldAddWakeupPrefix: true,
    });

    expect(result.usedWakeupPrefix).toBe(true);
    expect(result.text).not.toBe(result.entry.text);
    expect(result.text.startsWith('Pardon, je me réactive :')).toBe(true);
  });

  function createDeterministicRandomSource(fixedValue: number): RandomSource {
    return () => fixedValue;
  }
});
