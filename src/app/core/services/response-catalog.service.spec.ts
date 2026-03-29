import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ResponseCatalogService } from './response-catalog.service';

describe('ResponseCatalogService', () => {
  let service: ResponseCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    service = TestBed.inject(ResponseCatalogService);
  });

  it('exposes the reply catalog by category', () => {
    expect(service.replyCatalog.general.length).toBeGreaterThan(0);
    expect(service.replyCatalog.css.length).toBeGreaterThan(0);
    expect(service.replyCatalog.api.length).toBeGreaterThan(0);
    expect(service.replyCatalog.runtime.length).toBeGreaterThan(0);
    expect(service.replyCatalog.git.length).toBeGreaterThan(0);
    expect(service.replyCatalog.prod.length).toBeGreaterThan(0);
    expect(service.replyCatalog.empathic.length).toBeGreaterThan(0);
    expect(service.replyCatalog.absurd.length).toBeGreaterThan(0);
    expect(service.replyCatalog.offtopic.length).toBeGreaterThan(0);
  });

  it('exposes all auxiliary content families', () => {
    expect(service.openings.length).toBeGreaterThan(0);
    expect(service.sleepMessages.length).toBeGreaterThan(0);
    expect(service.wakeupPrefixes.length).toBeGreaterThan(0);
    expect(service.resolutionMessages.length).toBeGreaterThan(0);
    expect(service.shortMessageReplies.length).toBeGreaterThan(0);
    expect(service.longMessageReplies.length).toBeGreaterThan(0);
    expect(service.easterEggReplies.length).toBeGreaterThan(0);
    expect(service.swearReplies.length).toBeGreaterThan(0);
    expect(service.creditsLines.length).toBeGreaterThan(0);
    expect(service.messageExamples.length).toBeGreaterThan(0);
  });

  it('exposes the technical dictionaries', () => {
    expect(service.technicalKeywords.git.tokens.length).toBeGreaterThan(0);
    expect(service.swearWordTokens.length).toBeGreaterThan(0);
    expect(service.swearWordPhrases.length).toBeGreaterThan(0);
  });

  it('keeps the explicit swear response available', () => {
    expect(
      service.swearReplies.some(
        (entry) => entry.text === '😱 LANGAGE ! Il y a des canetons qui lisent !',
      ),
    ).toBe(true);
  });
});
