import { Router } from 'express';
import routes from './ai.routes.js';
import { registerAiHandlers } from './ai.events.js';

export function initAiModule() {
  registerAiHandlers();
}

export default function aiModule() {
  const router = Router();
  router.use(routes);
  return router;
}
