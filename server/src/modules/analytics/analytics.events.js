import { subscribe } from '../../common/lib/event-bus.js';
import * as analyticsService from './analytics.service.js';
import logger from '../../common/lib/logger.js';

export const EMITTED = Object.freeze({
  SNAPSHOT_CREATED: 'analytics.snapshot_created',
});

export const SUBSCRIPTIONS = [
  'challenge.state_changed',
  'validation.sign_off',
  'project.created',
];

export function registerAnalyticsHandlers() {
  for (const eventName of SUBSCRIPTIONS) {
    subscribe(eventName, async (event) => {
      try {
        await analyticsService.rebuildOnEvent(event);
      } catch (err) {
        logger.warn({ err, event: eventName }, 'Analytics snapshot rebuild failed');
      }
    });
  }
}

export default { EMITTED, SUBSCRIPTIONS, registerAnalyticsHandlers };
