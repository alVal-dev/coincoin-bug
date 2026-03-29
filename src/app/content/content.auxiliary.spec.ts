import { describe, expect, it } from 'vitest';

import {
  CREDITS_LINES,
  MESSAGE_EXAMPLES,
  SWEAR_WORD_PHRASES,
  SWEAR_WORD_TOKENS,
  TECHNICAL_KEYWORDS,
} from './index';

describe('auxiliary content', () => {
  it('contains the four clickable message examples', () => {
    expect(MESSAGE_EXAMPLES).toHaveLength(4);

    expect(MESSAGE_EXAMPLES.map((entry) => entry.text)).toEqual([
      'Mon CSS refuse de centrer quoi que ce soit',
      'J’ai un 500 en prod',
      'J’ai cassé Git et probablement ma dignité',
      'J’ai undefined alors que ça marchait hier',
    ]);
  });

  it('contains non-empty credits lines', () => {
    expect(CREDITS_LINES.length).toBeGreaterThan(0);
    expect(CREDITS_LINES.every((line) => line.text.trim().length > 0)).toBe(true);
  });

  it('contains the required swear word dictionaries', () => {
    expect(SWEAR_WORD_TOKENS).toContain('merde');
    expect(SWEAR_WORD_TOKENS).toContain('putain');
    expect(SWEAR_WORD_PHRASES).toContain('fait chier');
    expect(SWEAR_WORD_PHRASES).toContain('fais chier');
  });

  it('contains technical keyword groups for all categories', () => {
    expect(Object.keys(TECHNICAL_KEYWORDS)).toEqual([
      'git',
      'api',
      'runtime',
      'css',
      'prod',
      'general',
    ]);
  });

  it('keeps general empty in the technical keyword dictionary', () => {
    expect(TECHNICAL_KEYWORDS.general.tokens).toHaveLength(0);
    expect(TECHNICAL_KEYWORDS.general.phrases).toHaveLength(0);
  });

  it('contains non-empty keyword sets for major technical categories', () => {
    expect(TECHNICAL_KEYWORDS.git.tokens.length).toBeGreaterThan(0);
    expect(TECHNICAL_KEYWORDS.api.tokens.length).toBeGreaterThan(0);
    expect(TECHNICAL_KEYWORDS.runtime.tokens.length).toBeGreaterThan(0);
    expect(TECHNICAL_KEYWORDS.css.tokens.length).toBeGreaterThan(0);
    expect(TECHNICAL_KEYWORDS.prod.tokens.length).toBeGreaterThan(0);
  });
});
