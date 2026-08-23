import { subscribe } from '../../common/lib/event-bus.js';
import logger from '../../common/lib/logger.js';

export const EMITTED = Object.freeze({
  CREATED: 'capability_profile.created',
  UPDATED: 'capability_profile.updated',
});

export const SUBSCRIPTIONS = [];

export function registerCapabilityProfileHandlers() {
  subscribe('org.verified', async (event) => {
    logger.debug({ orgId: event.resourceId }, 'Capability profiles: org verified — profile enrichment eligible');
  });
}

export default { EMITTED, SUBSCRIPTIONS, registerCapabilityProfileHandlers };
