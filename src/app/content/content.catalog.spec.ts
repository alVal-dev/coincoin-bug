import { describe, expect, it } from 'vitest';

import {
  ABSURD_REPLIES,
  API_REPLIES,
  CSS_REPLIES,
  EMPATHIC_REPLIES,
  EASTER_EGG_REPLIES,
  GENERAL_REPLIES,
  GIT_REPLIES,
  LONG_MESSAGE_REPLIES,
  OFFTOPIC_REPLIES,
  OPENING_MESSAGES,
  PROD_REPLIES,
  RESOLUTION_MESSAGES,
  RUNTIME_REPLIES,
  SHORT_MESSAGE_REPLIES,
  SLEEP_MESSAGES,
  SWEAR_REPLIES,
  WAKEUP_PREFIXES,
} from './index';
import { DUCK_MESSAGE_CATEGORIES, DUCK_MOODS } from '../models';

describe('content catalog', () => {
  const duckFamilies = [
    OPENING_MESSAGES,
    GENERAL_REPLIES,
    CSS_REPLIES,
    API_REPLIES,
    RUNTIME_REPLIES,
    GIT_REPLIES,
    PROD_REPLIES,
    EMPATHIC_REPLIES,
    ABSURD_REPLIES,
    OFFTOPIC_REPLIES,
    SHORT_MESSAGE_REPLIES,
    LONG_MESSAGE_REPLIES,
    SWEAR_REPLIES,
    EASTER_EGG_REPLIES,
    SLEEP_MESSAGES,
    RESOLUTION_MESSAGES,
  ];

  it('contains unique ids across all duck content families', () => {
    const ids = duckFamilies.flat().map((entry) => entry.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('contains all required duck families with non-empty content', () => {
    for (const family of duckFamilies) {
      expect(family.length).toBeGreaterThan(0);
    }

    expect(WAKEUP_PREFIXES.length).toBeGreaterThan(0);
  });

  it('uses only valid moods and categories', () => {
    const validMoods = new Set(DUCK_MOODS);
    const validCategories = new Set(DUCK_MESSAGE_CATEGORIES);

    for (const entry of duckFamilies.flat()) {
      expect(validMoods.has(entry.mood)).toBe(true);
      expect(validCategories.has(entry.category)).toBe(true);
    }
  });

  it('does not duplicate text within the same pool', () => {
    for (const family of duckFamilies) {
      const texts = family.map((entry) => entry.text);
      const uniqueTexts = new Set(texts);

      expect(uniqueTexts.size).toBe(texts.length);
    }
  });

  it('uses general consistently and never generic', () => {
    const categories = duckFamilies.flat().map((entry) => entry.category);

    expect(categories.includes('general')).toBe(true);
    expect(categories.includes('generic' as never)).toBe(false);
  });

  it('contains the mandatory absurd and resolution lines', () => {
    expect(
      ABSURD_REPLIES.some((entry) => entry.text === 'Et si tu réécrivais tout en Rust ?'),
    ).toBe(true);

    expect(
      RESOLUTION_MESSAGES.some(
        (entry) => entry.text === 'Ça, c’est du rubber duck debugging de qualité professionnelle.',
      ),
    ).toBe(true);
  });

  it('contains the explicit swear response', () => {
    expect(
      SWEAR_REPLIES.some((entry) => entry.text === '😱 LANGAGE ! Il y a des canetons qui lisent !'),
    ).toBe(true);
  });
});
