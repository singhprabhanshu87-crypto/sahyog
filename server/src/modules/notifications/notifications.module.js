import { Router } from 'express';
import routes from './notifications.routes.js';
import { registerNotificationHandlers } from './notifications.events.js';

export function initNotificationsModule() {
  registerNotificationHandlers();
}

export default function notificationsModule() {
  const router = Router();
  router.use(routes);
  return router;
}
