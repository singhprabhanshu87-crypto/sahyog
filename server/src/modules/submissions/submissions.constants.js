export const SUBMISSION_STATUS = Object.freeze({
  RECEIVED: 'received',
  INTAKE: 'intake',
  EMBEDDING: 'embedding',
  DEDUP: 'dedup',
  CLASSIFICATION: 'classification',
  TRIAGED: 'triaged',
  CLUSTERED: 'clustered',
  REJECTED: 'rejected',
});

export const SUBMISSION_TYPES = Object.freeze({
  DIRECT: 'direct',
  ASSISTED: 'assisted',
});

export const SUBMISSION_CHANNELS = Object.freeze({
  WEB: 'web',
  MOBILE: 'mobile',
  VOICE: 'voice',
  FACILITATOR: 'facilitator',
});

export default { SUBMISSION_STATUS, SUBMISSION_TYPES, SUBMISSION_CHANNELS };
