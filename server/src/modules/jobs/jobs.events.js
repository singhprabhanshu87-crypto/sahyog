import { subscribe } from '../../common/lib/event-bus.js';
import { enqueueIntake } from './lib/queues.js';
import logger from '../../common/lib/logger.js';

export const EMITTED = Object.freeze({
  ENQUEUED: 'job.enqueued',
  COMPLETED: 'job.completed',
  FAILED: 'job.failed',
});

export const SUBSCRIPTIONS = Object.freeze([
  { event: 'submission.created', handler: 'enqueueIntakeOnSubmissionCreated' },
]);

export function registerJobHandlers() {
  subscribe('submission.created', async (event) => {
    const submissionId = event.resourceId;
    if (!submissionId) return;

    try {
      await enqueueIntake(submissionId);
      logger.debug({ submissionId }, 'Intake job enqueued from submission.created event');
    } catch (err) {
      logger.error({ err, submissionId }, 'Failed to enqueue intake job');
    }
  });
}

export default { EMITTED, SUBSCRIPTIONS, registerJobHandlers };
