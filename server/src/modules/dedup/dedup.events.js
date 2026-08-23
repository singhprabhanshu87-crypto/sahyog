export const EMITTED = Object.freeze({
  DECIDED: 'dedup.decided',
  MATCHED: 'dedup.matched',
});

export const SUBSCRIPTIONS = [];

export function registerDedupHandlers() {
  // Dedup triggered by job processors
}

export default { EMITTED, SUBSCRIPTIONS, registerDedupHandlers };
