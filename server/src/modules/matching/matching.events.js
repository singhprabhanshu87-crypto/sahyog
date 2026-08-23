import { subscribe } from '../../common/lib/event-bus.js';
import logger from '../../common/lib/logger.js';

export const EMITTED = Object.freeze({
  RUN_COMPLETED: 'matching.run_completed',
});

export const SUBSCRIPTIONS = ['challenge.scoped'];

export function registerMatchingHandlers() {
  subscribe('challenge.scoped', async (event) => {
    logger.debug({ challengeId: event.resourceId }, 'Matching: challenge scoped — eligible for match run');
  });
}

export default { EMITTED, SUBSCRIPTIONS, registerMatchingHandlers };
