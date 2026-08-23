export const EMITTED = Object.freeze({
  TRANSLATED: 'language.translated',
  LOW_CONFIDENCE: 'language.low_confidence',
});

export const SUBSCRIPTIONS = [];

export function registerLanguageHandlers() {
  // Language module has no subscriptions in Phase 2
}

export default { EMITTED, SUBSCRIPTIONS, registerLanguageHandlers };
