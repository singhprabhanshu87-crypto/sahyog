import { Router } from 'express';
import routes from './milestones.routes.js';
import { registerMilestoneHandlers } from './milestones.events.js';

export function initMilestonesModule() {
  registerMilestoneHandlers();
}

export default function milestonesModule() {
  const router = Router();
  router.use(routes);
  return router;
}
