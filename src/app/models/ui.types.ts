export const HOME_VIEW_MODES = ['welcome', 'chat'] as const;

export type HomeViewMode = (typeof HOME_VIEW_MODES)[number];

export const SESSION_PHASES = ['opening', 'playful', 'empathetic', 'veteran'] as const;

export type SessionPhase = (typeof SESSION_PHASES)[number];

export const CREDITS_PRESENTATION_MODES = ['animated', 'static'] as const;

export type CreditsPresentationMode = (typeof CREDITS_PRESENTATION_MODES)[number];
