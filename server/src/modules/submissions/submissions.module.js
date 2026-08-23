import { Router } from 'express';
import routes from './submissions.routes.js';
import { registerSubmissionHandlers } from './submissions.events.js';

export function initSubmissionsModule() {
  registerSubmissionHandlers();
}

export default function submissionsModule() {
  const router = Router();
  router.use(routes);
  return router;
}
