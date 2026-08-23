import * as eventsService from './events.service.js';
import { getContext } from '../../common/middleware/request-context.js';

export const EMITTED = Object.freeze({
  APPENDED: 'event.appended',
});

export const SUBSCRIPTIONS = [];

export async function persistEvent(record) {
  const context = getContext();
  return eventsService.append({
    ...record,
    correlationId: record.correlationId || context.correlationId,
  });
}

export function registerEventHandlers() {
  // Phase 1: no cross-module subscriptions yet
}

export default { EMITTED, SUBSCRIPTIONS, persistEvent, registerEventHandlers };
