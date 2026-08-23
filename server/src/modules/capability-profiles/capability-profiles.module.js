import { Router } from 'express';
import routes from './capability-profiles.routes.js';
import { registerCapabilityProfileHandlers } from './capability-profiles.events.js';

export function initCapabilityProfilesModule() {
  registerCapabilityProfileHandlers();
}

export default function capabilityProfilesModule() {
  const router = Router();
  router.use(routes);
  return router;
}
