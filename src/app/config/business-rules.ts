/**
 * Rubber Duck Debugger — Règles métier et constantes de comportement
 *
 * Ce fichier centralise les seuils et délais qui influencent
 * directement les flux métier de l'application.
 *
 * Il ne contient pas de logique, seulement des valeurs de référence.
 */

export const SHORT_MESSAGE_THRESHOLD = 10;

export const LONG_MESSAGE_THRESHOLD = 500;

export const DUCK_THINKING_DELAY_MS = 1_500;

export const SLEEP_INACTIVITY_DELAY_MS = 10_000;

export const SLEEP_MIN_USER_MESSAGES = 2;

export const SLEEP_COOLDOWN_MESSAGES = 2;

export const CREDITS_RETURN_BANNER_DURATION_MS = 5_000;

export const CREDITS_SCROLL_DURATION_MS = 20_000;
