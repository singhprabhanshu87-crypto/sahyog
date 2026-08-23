import { Router } from 'express';
import routes from './workflow.routes.js';
import { registerWorkflowHandlers } from './workflow.events.js';

export function initWorkflowModule() {
  registerWorkflowHandlers();
}

export default function workflowModule() {
  const router = Router();
  router.use(routes);
  return router;
}
