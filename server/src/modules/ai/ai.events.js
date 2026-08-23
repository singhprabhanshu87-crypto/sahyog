export const EMITTED = Object.freeze({
  CALL_COMPLETED: 'ai.call_completed',
  CALL_FAILED: 'ai.call_failed',
});

export const SUBSCRIPTIONS = [];

export function registerAiHandlers() {
  // AI module has no event subscriptions
}

export default { EMITTED, SUBSCRIPTIONS, registerAiHandlers };
