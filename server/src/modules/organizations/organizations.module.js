import { Router } from 'express';
import routes from './organizations.routes.js';
import { registerOrganizationHandlers } from './organizations.events.js';

export function initOrganizationsModule() {
  registerOrganizationHandlers();
}

export default function organizationsModule() {
  const router = Router();
  router.use(routes);
  return router;
}
