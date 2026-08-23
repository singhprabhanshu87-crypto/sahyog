/**
 * Persist-then-dispatch event bus.
 * common/ must not import modules — persistence is injected at bootstrap.
 */
import { EventEmitter } from 'node:events';
import logger from './logger.js';

const emitter = new EventEmitter();
emitter.setMaxListeners(50);

let persistHandler = null;

export function registerPersistence(handler) {
  persistHandler = handler;
}

export function subscribe(eventName, handler) {
  emitter.on(eventName, handler);
  return () => emitter.off(eventName, handler);
}

export function subscribeAll(handler) {
  emitter.on('*', handler);
  return () => emitter.off('*', handler);
}

/**
 * Publish an event: persist to events collection first, then dispatch.
 */
export async function publish(event) {
  const record = {
    actor: event.actor,
    action: event.action,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    payload: event.payload ?? {},
    rationale: event.rationale ?? null,
    correlationId: event.correlationId,
    timestamp: event.timestamp ?? new Date(),
  };

  let persisted;
  if (persistHandler) {
    persisted = await persistHandler(record);
  } else {
    logger.warn({ action: record.action }, 'Event bus persistence not registered — event not stored');
    persisted = record;
  }

  emitter.emit(record.action, persisted);
  emitter.emit('*', persisted);

  return persisted;
}

export default { registerPersistence, subscribe, subscribeAll, publish };
