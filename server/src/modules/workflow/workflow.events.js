import { subscribe } from '../../common/lib/event-bus.js';
import * as workflowService from './workflow.service.js';
import { WORKFLOW_TRANSITIONS } from './workflow.constants.js';
import logger from '../../common/lib/logger.js';

export const EMITTED = Object.freeze({
  TRANSITIONED: 'workflow.transitioned',
});

export const SUBSCRIPTIONS = [
  'challenge.created',
  'challenge.scoped',
  'claim.created',
  'project.created',
];

export function registerWorkflowHandlers() {
  subscribe('challenge.created', async (event) => {
    try {
      await workflowService.getOrCreate(event.resourceId);
    } catch (err) {
      logger.warn({ err, challengeId: event.resourceId }, 'Failed to init workflow on challenge.created');
    }
  });

  subscribe('challenge.scoped', async (event) => {
    try {
      await workflowService.transition(event.resourceId, WORKFLOW_TRANSITIONS.SCOPE, event.actor, {
        rationale: 'Auto-transition on scope',
      });
    } catch (err) {
      logger.debug({ err, challengeId: event.resourceId }, 'Workflow scope transition skipped or failed');
    }
  });

  subscribe('claim.created', async (event) => {
    const challengeId = event.payload?.challengeId;
    if (!challengeId) return;
    try {
      await workflowService.transition(challengeId, WORKFLOW_TRANSITIONS.CLAIM, event.actor, {
        rationale: 'Auto-transition on claim',
      });
    } catch (err) {
      logger.debug({ err, challengeId }, 'Workflow claim transition skipped or failed');
    }
  });

  subscribe('project.created', async (event) => {
    const challengeId = event.payload?.challengeId;
    if (!challengeId) return;
    try {
      await workflowService.transition(challengeId, WORKFLOW_TRANSITIONS.START_PROJECT, event.actor, {
        rationale: 'Auto-transition on project start',
      });
    } catch (err) {
      logger.debug({ err, challengeId }, 'Workflow start_project transition skipped or failed');
    }
  });
}

export default { EMITTED, SUBSCRIPTIONS, registerWorkflowHandlers };
