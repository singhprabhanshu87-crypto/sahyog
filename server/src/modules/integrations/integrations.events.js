import { subscribe } from '../../common/lib/event-bus.js';
import * as integrationsService from './integrations.service.js';
import logger from '../../common/lib/logger.js';

export const EMITTED = Object.freeze({
  GRIEVANCE_FORWARDED: 'integration.grievance_forwarded',
});

export const SUBSCRIPTIONS = [
  'dispute.escalated',
  'validation.sign_off',
];

export function registerIntegrationHandlers() {
  subscribe('dispute.escalated', async (event) => {
    logger.debug({ disputeId: event.resourceId }, 'Integrations: dispute escalated — grievance forward eligible');
  });

  subscribe('validation.sign_off', async (event) => {
    if (event.actor?.email) {
      await integrationsService.sendEmailStub({
        to: event.actor.email,
        subject: 'Validation sign-off recorded',
        body: `Challenge ${event.resourceId} validated`,
      }, event.actor);
    }
  });
}

export default { EMITTED, SUBSCRIPTIONS, registerIntegrationHandlers };
