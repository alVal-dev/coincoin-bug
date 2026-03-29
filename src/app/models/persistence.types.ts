import type { DuckSession } from './domain.types';

export const STORAGE_KEYS = {
  session: 'duck_session',
  theme: 'duck_theme',
  creditsAccess: 'duck_credits_access',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const SESSION_STORAGE_VERSION = 1 as const;

export interface PersistedDuckSession {
  version: typeof SESSION_STORAGE_VERSION;
  session: DuckSession;
}
