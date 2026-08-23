export const QUEUE_NAMES = Object.freeze({
  INTAKE: 'intake',
  EMBEDDING: 'embedding',
  DEDUP: 'dedup',
  CLASSIFICATION: 'classification',
  MATCHING: 'matching',
  NOTIFICATIONS: 'notifications',
  SCHEDULED: 'scheduled',
});

export const JOB_NAMES = Object.freeze({
  INTAKE_PROCESS: 'intake.process',
  EMBEDDING_GENERATE: 'embedding.generate',
  DEDUP_CHECK: 'dedup.check',
  CLASSIFICATION_RUN: 'classification.run',
  MATCHING_SHORTLIST: 'matching.shortlist',
  NOTIFICATION_SEND: 'notification.send',
  SCHEDULED_TICK: 'scheduled.tick',
});

export default { QUEUE_NAMES, JOB_NAMES };
