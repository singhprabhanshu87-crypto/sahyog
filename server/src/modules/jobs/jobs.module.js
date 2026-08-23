import { Router } from 'express';
import routes from './jobs.routes.js';
import { registerJobHandlers } from './jobs.events.js';

export function initJobsModule() {
  registerJobHandlers();
}

export default function jobsModule() {
  const router = Router();
  router.use(routes);
  return router;
}
