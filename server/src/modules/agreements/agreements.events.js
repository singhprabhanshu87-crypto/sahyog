import { subscribe } from '../../common/lib/event-bus.js';
import logger from '../../common/lib/logger.js';

export const EMITTED = Object.freeze({
  CREATED: 'agreement.created',
  SIGNED: 'agreement.signed',
  SIGNATURE_ADDED: 'agreement.signature_added',
});

export const SUBSCRIPTIONS = ['team.created'];

export function registerAgreementHandlers() {
  subscribe('team.created', async (event) => {
    logger.debug({ teamId: event.resourceId }, 'Agreements: team created — agreement may be required');
  });
}

export default { EMITTED, SUBSCRIPTIONS, registerAgreementHandlers };
