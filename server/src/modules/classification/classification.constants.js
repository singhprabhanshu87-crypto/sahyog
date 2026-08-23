export const REVIEW_QUEUE_STATUS = Object.freeze({
  PENDING: 'pending',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated',
});

export const REVIEW_REASONS = Object.freeze({
  LOW_CONFIDENCE_TRIAGE: 'low_confidence_triage',
  LOW_CONFIDENCE_CATEGORY: 'low_confidence_category',
  LANGUAGE_ASSIST: 'language_assist',
  MANUAL: 'manual',
});

export const TRIAGE_TYPES = Object.freeze({
  GRIEVANCE: 'grievance',
  CHALLENGE: 'challenge',
  UNKNOWN: 'unknown',
});

export default { REVIEW_QUEUE_STATUS, REVIEW_REASONS, TRIAGE_TYPES };
