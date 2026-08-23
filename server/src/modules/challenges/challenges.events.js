import { subscribe } from '../../common/lib/event-bus.js';
import * as challengesService from './challenges.service.js';
import { CHALLENGE_WORKFLOW_STATES } from '../../config/constants.js';
import logger from '../../common/lib/logger.js';

export const EMITTED = Object.freeze({
  CREATED: 'challenge.created',
  SCOPED: 'challenge.scoped',
  STATE_CHANGED: 'challenge.state_changed',
});

export const SUBSCRIPTIONS = [
  'workflow.transitioned',
];

export function registerChallengeHandlers() {
  subscribe('workflow.transitioned', async (event) => {
    const { challengeId, to } = event.payload ?? {};
    if (!challengeId || !to) return;

    try {
      await challengesService.updateWorkflowState(challengeId, to, event.actor, {
        from: event.payload.from,
      });
      logger.debug({ challengeId, to }, 'Challenge state synced from workflow');
    } catch (err) {
      logger.warn({ err, challengeId }, 'Failed to sync challenge state from workflow');
    }
  });

  subscribe('validation.sign_off', async (event) => {
    const challengeId = event.resourceId;
    if (!challengeId) return;
    try {
      await challengesService.updateWorkflowState(
        challengeId,
        CHALLENGE_WORKFLOW_STATES.VALIDATED,
        event.actor,
        { from: event.payload?.from },
      );
    } catch (err) {
      logger.warn({ err, challengeId }, 'Failed to update challenge on validation sign-off');
    }
  });
}

export default { EMITTED, SUBSCRIPTIONS, registerChallengeHandlers };
