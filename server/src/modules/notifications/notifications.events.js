import { subscribe } from '../../common/lib/event-bus.js';
import * as notificationsService from './notifications.service.js';

export const EMITTED = Object.freeze({
  CREATED: 'notification.created',
});

export const SUBSCRIPTIONS = [
  'challenge.state_changed',
  'workflow.transitioned',
  'claim.created',
  'claim.released',
  'project.created',
  'milestone.reviewed',
  'validation.sign_off',
  'dispute.escalated',
  'matching.run_completed',
  'agreement.signed',
];

const STATE_CHANGE_EVENTS = [
  'challenge.state_changed',
  'workflow.transitioned',
];

export function registerNotificationHandlers() {
  for (const eventName of SUBSCRIPTIONS) {
    subscribe(eventName, async (event) => {
      if (STATE_CHANGE_EVENTS.includes(eventName)) {
        await notificationsService.handleStateChangeEvent(event);
      } else {
        const actorId = event.actor?.id;
        if (actorId && actorId !== 'system') {
          await notificationsService.createFromEvent(event, [actorId]);
        }
      }
    });
  }
}

export default { EMITTED, SUBSCRIPTIONS, registerNotificationHandlers };
