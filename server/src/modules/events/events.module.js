import { Router } from 'express';
import routes from './events.routes.js';
import { registerPersistence } from '../../common/lib/event-bus.js';
import { persistEvent, registerEventHandlers } from './events.events.js';

export function initEventsModule() {
  registerPersistence(persistEvent);
  registerEventHandlers();
}

export default function eventsModule() {
  const router = Router();
  router.use(routes);
  return router;
}
