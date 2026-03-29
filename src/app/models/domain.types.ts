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

export const DUCK_ANIMATION_STATES = [
  'idle',
  'wave',
  'thinking',
  'bounce',
  'sleeping',
  'none',
] as const;

export type DuckAnimationState = (typeof DUCK_ANIMATION_STATES)[number];

export const KEYWORD_CATEGORIES = ['git', 'api', 'runtime', 'css', 'prod', 'general'] as const;

export type KeywordCategory = (typeof KEYWORD_CATEGORIES)[number];

export const REPLY_POOL_CATEGORIES = [
  ...KEYWORD_CATEGORIES,
  'empathic',
  'absurd',
  'offtopic',
] as const;

export type ReplyPoolCategory = (typeof REPLY_POOL_CATEGORIES)[number];

export const DUCK_MESSAGE_CATEGORIES = [
  'opening',
  'sleep',
  'resolution',
  ...REPLY_POOL_CATEGORIES,
] as const;

export type DuckMessageCategory = (typeof DUCK_MESSAGE_CATEGORIES)[number];

export const CHAT_MESSAGE_AUTHORS = ['user', 'duck'] as const;

export type ChatMessageAuthor = (typeof CHAT_MESSAGE_AUTHORS)[number];

export const DUCK_MESSAGE_KINDS = ['opening', 'reply', 'sleep', 'resolution'] as const;

export type DuckMessageKind = (typeof DUCK_MESSAGE_KINDS)[number];

export const SESSION_STATUSES = ['active', 'resolved'] as const;

export type DuckSessionStatus = (typeof SESSION_STATUSES)[number];

interface BaseChatMessage {
  id: string;
  text: string;
  createdAt: number;
}

export interface UserChatMessage extends BaseChatMessage {
  author: 'user';
}

export interface DuckChatMessage extends BaseChatMessage {
  author: 'duck';
  kind: DuckMessageKind;
  mood: DuckMood;
  category: DuckMessageCategory;
}

export type ChatMessage = UserChatMessage | DuckChatMessage;

export interface DuckSession {
  id: string;
  status: DuckSessionStatus;
  startedAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  userMessageCount: number;
  responseHistory: string[];
  messagesSinceLastSleep: number;
  lastDuckReplyAt: number | null;
}
