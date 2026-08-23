import { Router } from 'express';
import routes from './integrations.routes.js';
import { registerIntegrationHandlers } from './integrations.events.js';

export function initIntegrationsModule() {
  registerIntegrationHandlers();
}

export default function integrationsModule() {
  const router = Router();
  router.use(routes);
  return router;
}
