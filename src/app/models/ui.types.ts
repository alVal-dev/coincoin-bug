export const HOME_VIEW_MODES = ['welcome', 'chat'] as const;

export type HomeViewMode = (typeof HOME_VIEW_MODES)[number];

export const CHAT_RUNTIME_STATES = ['ready', 'thinking', 'sleeping', 'celebrating'] as const;

export type ChatRuntimeState = (typeof CHAT_RUNTIME_STATES)[number];

export const CREDITS_PRESENTATION_MODES = ['animated', 'static'] as const;

export type CreditsPresentationMode = (typeof CREDITS_PRESENTATION_MODES)[number];
