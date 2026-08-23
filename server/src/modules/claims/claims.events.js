import { subscribe } from '../../common/lib/event-bus.js';
import * as claimsService from './claims.service.js';
import logger from '../../common/lib/logger.js';

export const EMITTED = Object.freeze({
  CREATED: 'claim.created',
  RELEASED: 'claim.released',
});

export const SUBSCRIPTIONS = ['project.created'];

export function registerClaimHandlers() {
  subscribe('project.created', async (event) => {
    const claimId = event.payload?.claimId;
    if (!claimId) return;
    try {
      const claim = await claimsService.findById(claimId);
      logger.debug({ claimId }, 'Claim activity recorded on project.created');
    } catch (err) {
      logger.debug({ err, claimId }, 'Claim activity update skipped');
    }
  });
}

export default { EMITTED, SUBSCRIPTIONS, registerClaimHandlers };
