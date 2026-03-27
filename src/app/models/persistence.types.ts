import type { AppTheme, DuckSession } from './domain.types';

export const STORAGE_KEYS = {
  session: 'duck_session',
  theme: 'duck_theme',
  creditsAccess: 'duck_credits_access',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const DUCK_SESSION_STORAGE_VERSION = 1 as const;

export interface PersistedDuckSessionV1 {
  readonly version: typeof DUCK_SESSION_STORAGE_VERSION;
  readonly session: DuckSession;
}

export type PersistedDuckSession = PersistedDuckSessionV1;

export type PersistedTheme = AppTheme;

/**
 * Présence de la clé = accès autorisé.
 * Absence de la clé = accès interdit.
 */
export type PersistedCreditsAccess = 'true';
