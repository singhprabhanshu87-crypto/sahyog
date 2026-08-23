export const EMITTED = Object.freeze({
  TRIAGED: 'classification.triaged',
  CATEGORIZED: 'classification.categorized',
  REVIEW_QUEUED: 'classification.review_queued',
  OVERRIDE: 'classification.override',
});

export const SUBSCRIPTIONS = [];

export function registerClassificationHandlers() {
  // Classification triggered by job processors
}

export default { EMITTED, SUBSCRIPTIONS, registerClassificationHandlers };
