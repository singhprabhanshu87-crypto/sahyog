export const EMITTED = Object.freeze({
  CREATED: 'submission.created',
  INTAKE_COMPLETE: 'submission.intake_complete',
  EMBEDDED: 'submission.embedded',
  DEDUPED: 'submission.deduped',
  CLASSIFIED: 'submission.classified',
});

export const SUBSCRIPTIONS = Object.freeze([
  { event: EMITTED.CREATED, handler: 'enqueueIntake' },
]);

export function registerSubmissionHandlers() {
  // Intake enqueue is handled in service at creation time;
  // additional cross-module subscriptions can be added here.
}

export default { EMITTED, SUBSCRIPTIONS, registerSubmissionHandlers };
