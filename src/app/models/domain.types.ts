export type EpochMs = number;
export type SessionId = string;
export type MessageId = string;
export type ResponseId = string;

// ──────────────────────────────────────────────
// Thème
// ──────────────────────────────────────────────

export const APP_THEMES = ['zen', 'chaos'] as const;
export type AppTheme = (typeof APP_THEMES)[number];

// ──────────────────────────────────────────────
// Expressions du canard
// ──────────────────────────────────────────────

export const DUCK_MOODS = [
  'welcoming',
  'curious',
  'thinking',
  'sarcastic',
  'empathetic',
  'confused',
  'celebrating',
  'sleeping',
] as const;

export type DuckMood = (typeof DUCK_MOODS)[number];

// ──────────────────────────────────────────────
// Statut de session
// ──────────────────────────────────────────────

export const SESSION_STATUSES = ['active', 'resolved'] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

// ──────────────────────────────────────────────
// Messages
// ──────────────────────────────────────────────

export const MESSAGE_AUTHORS = ['user', 'duck'] as const;
export type MessageAuthor = (typeof MESSAGE_AUTHORS)[number];

export const DUCK_MESSAGE_KINDS = ['opening', 'reply', 'sleep', 'resolution'] as const;

export type DuckMessageKind = (typeof DUCK_MESSAGE_KINDS)[number];

interface BaseChatMessage {
  readonly id: MessageId;
  readonly text: string;
  readonly createdAt: EpochMs;
}

export interface UserChatMessage extends BaseChatMessage {
  readonly author: 'user';
}

interface BaseDuckChatMessage extends BaseChatMessage {
  readonly author: 'duck';
  readonly mood: DuckMood;
  readonly responseId: ResponseId;
}

// ──────────────────────────────────────────────
// Catégories
// ──────────────────────────────────────────────

export const KEYWORD_CATEGORIES = ['css', 'api', 'runtime', 'git', 'prod', 'general'] as const;

export type KeywordCategory = (typeof KEYWORD_CATEGORIES)[number];

export const THEMATIC_RESPONSE_CATEGORIES = [
  'generic',
  'css',
  'api',
  'runtime',
  'git',
  'prod',
  'empathetic',
  'absurd',
  'off-topic',
  'easter-egg',
  'short-message',
  'long-message',
] as const;

export type ThematicResponseCategory = (typeof THEMATIC_RESPONSE_CATEGORIES)[number];

export const LIFECYCLE_RESPONSE_CATEGORIES = ['opening', 'sleep', 'resolution'] as const;

export type LifecycleResponseCategory = (typeof LIFECYCLE_RESPONSE_CATEGORIES)[number];

export const RESPONSE_CATEGORIES = [
  'opening',
  'sleep',
  'resolution',
  'generic',
  'css',
  'api',
  'runtime',
  'git',
  'prod',
  'empathetic',
  'absurd',
  'off-topic',
  'easter-egg',
  'short-message',
  'long-message',
] as const;

export type ResponseCategory = (typeof RESPONSE_CATEGORIES)[number];

// ──────────────────────────────────────────────
// Catalogue de contenu
// ──────────────────────────────────────────────

export interface DuckResponse {
  readonly id: ResponseId;
  readonly text: string;
  readonly mood: DuckMood;
  readonly category: ResponseCategory;
}

export interface EasterEggEntry {
  readonly triggers: readonly string[];
  readonly response: DuckResponse;
}

// ──────────────────────────────────────────────
// Messages du canard — union stricte
// ──────────────────────────────────────────────

export interface DuckOpeningMessage extends BaseDuckChatMessage {
  readonly kind: 'opening';
  readonly category: 'opening';
}

export interface DuckReplyMessage extends BaseDuckChatMessage {
  readonly kind: 'reply';
  readonly category: ThematicResponseCategory;
}

export interface DuckSleepMessage extends BaseDuckChatMessage {
  readonly kind: 'sleep';
  readonly category: 'sleep';
}

export interface DuckResolutionMessage extends BaseDuckChatMessage {
  readonly kind: 'resolution';
  readonly category: 'resolution';
}

export type DuckChatMessage =
  | DuckOpeningMessage
  | DuckReplyMessage
  | DuckSleepMessage
  | DuckResolutionMessage;

export type ChatMessage = UserChatMessage | DuckChatMessage;

// ──────────────────────────────────────────────
// Session
// ──────────────────────────────────────────────

export interface DuckSession {
  readonly id: SessionId;
  readonly status: SessionStatus;
  readonly startedAt: EpochMs;
  readonly updatedAt: EpochMs;
  readonly messages: readonly ChatMessage[];
  readonly userMessageCount: number;
  readonly responseHistory: readonly ResponseId[];
  readonly messagesSinceLastSleep: number;
  readonly lastDuckReplyAt: EpochMs | null;
}
