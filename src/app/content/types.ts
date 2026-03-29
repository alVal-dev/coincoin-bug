import type { DuckMessageCategory, DuckMood, KeywordCategory, ReplyPoolCategory } from '../models';

export interface DuckContentEntry {
  id: string;
  text: string;
  mood: DuckMood;
  category: DuckMessageCategory;
}

export interface WakeupPrefixEntry {
  id: string;
  text: string;
}

export interface CreditsLine {
  id: string;
  text: string;
}

export interface MessageExampleEntry {
  id: string;
  text: string;
}

export interface KeywordMatcherGroup {
  tokens: readonly string[];
  phrases: readonly string[];
}

export type TechnicalKeywordDictionary = Readonly<Record<KeywordCategory, KeywordMatcherGroup>>;

export interface ReplyCatalog {
  general: readonly DuckContentEntry[];
  css: readonly DuckContentEntry[];
  api: readonly DuckContentEntry[];
  runtime: readonly DuckContentEntry[];
  git: readonly DuckContentEntry[];
  prod: readonly DuckContentEntry[];
  empathic: readonly DuckContentEntry[];
  absurd: readonly DuckContentEntry[];
  offtopic: readonly DuckContentEntry[];
}

export type ReplyCatalogKey = keyof ReplyCatalog;

export type ReplyContentMap = Readonly<Record<ReplyPoolCategory, readonly DuckContentEntry[]>>;
