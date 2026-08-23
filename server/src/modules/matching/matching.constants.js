export const MATCH_RUN_STATUS = Object.freeze({
  PENDING: 'pending',
  SCORING: 'scoring',
  ASSIGNING: 'assigning',
  COMPLETED: 'completed',
  FAILED: 'failed',
});

export const MATCH_STAGE = Object.freeze({
  RELEVANCE: 'relevance',
  ASSIGNMENT: 'assignment',
});

export default { MATCH_RUN_STATUS, MATCH_STAGE };
