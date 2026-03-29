import type { TechnicalKeywordDictionary } from './types';

export const TECHNICAL_KEYWORDS: TechnicalKeywordDictionary = {
  git: {
    tokens: [
      'git',
      'commit',
      'branch',
      'merge',
      'rebase',
      'stash',
      'checkout',
      'reset',
      'cherry-pick',
      'pull',
      'push',
    ],
    phrases: ['merge conflict', 'detached head', 'pull request'],
  },
  api: {
    tokens: ['api', 'rest', 'graphql', 'endpoint', 'request', 'response', 'fetch', 'axios'],
    phrases: ['status code', 'request body', 'response body'],
  },
  runtime: {
    tokens: [
      'undefined',
      'null',
      'nan',
      'exception',
      'stack',
      'trace',
      'promise',
      'async',
      'await',
      'timeout',
    ],
    phrases: ['cannot read', 'is not a function', 'not defined'],
  },
  css: {
    tokens: [
      'css',
      'flex',
      'grid',
      'margin',
      'padding',
      'align',
      'justify',
      'center',
      'position',
      'display',
    ],
    phrases: ['z index', 'flex box', 'justify content'],
  },
  prod: {
    tokens: [
      'prod',
      'production',
      'deploy',
      'release',
      'incident',
      'rollback',
      'monitoring',
      'latency',
      'downtime',
      'outage',
      '500',
    ],
    phrases: ['en prod', 'en production', 'ça casse en prod'],
  },
  general: {
    tokens: [],
    phrases: [],
  },
};
