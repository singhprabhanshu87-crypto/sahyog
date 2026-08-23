import { Router } from 'express';
import routes from './analytics.routes.js';
import { registerAnalyticsHandlers } from './analytics.events.js';

export function initAnalyticsModule() {
  registerAnalyticsHandlers();
}

export default function analyticsModule() {
  const router = Router();
  router.use(routes);
  return router;
}
