import { Injectable } from '@angular/core';

import {
  ABSURD_REPLIES,
  API_REPLIES,
  CREDITS_LINES,
  CSS_REPLIES,
  EASTER_EGG_REPLIES,
  EMPATHIC_REPLIES,
  GENERAL_REPLIES,
  GIT_REPLIES,
  LONG_MESSAGE_REPLIES,
  MESSAGE_EXAMPLES,
  OFFTOPIC_REPLIES,
  OPENING_MESSAGES,
  PROD_REPLIES,
  RESOLUTION_MESSAGES,
  RUNTIME_REPLIES,
  SHORT_MESSAGE_REPLIES,
  SLEEP_MESSAGES,
  SWEAR_REPLIES,
  SWEAR_WORD_PHRASES,
  SWEAR_WORD_TOKENS,
  TECHNICAL_KEYWORDS,
  WAKEUP_PREFIXES,
  type ReplyContentMap,
} from '../../content';

@Injectable({
  providedIn: 'root',
})
export class ResponseCatalogService {
  readonly replyCatalog: ReplyContentMap = {
    general: GENERAL_REPLIES,
    css: CSS_REPLIES,
    api: API_REPLIES,
    runtime: RUNTIME_REPLIES,
    git: GIT_REPLIES,
    prod: PROD_REPLIES,
    empathic: EMPATHIC_REPLIES,
    absurd: ABSURD_REPLIES,
    offtopic: OFFTOPIC_REPLIES,
  };

  readonly openings = OPENING_MESSAGES;
  readonly sleepMessages = SLEEP_MESSAGES;
  readonly wakeupPrefixes = WAKEUP_PREFIXES;
  readonly resolutionMessages = RESOLUTION_MESSAGES;

  readonly shortMessageReplies = SHORT_MESSAGE_REPLIES;
  readonly longMessageReplies = LONG_MESSAGE_REPLIES;
  readonly easterEggReplies = EASTER_EGG_REPLIES;
  readonly swearReplies = SWEAR_REPLIES;

  readonly creditsLines = CREDITS_LINES;
  readonly messageExamples = MESSAGE_EXAMPLES;

  readonly technicalKeywords = TECHNICAL_KEYWORDS;
  readonly swearWordTokens = SWEAR_WORD_TOKENS;
  readonly swearWordPhrases = SWEAR_WORD_PHRASES;
}
