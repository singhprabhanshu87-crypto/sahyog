import { Router } from 'express';
import routes from './matching.routes.js';
import { registerMatchingHandlers } from './matching.events.js';

export function initMatchingModule() {
  registerMatchingHandlers();
}

export default function matchingModule() {
  const router = Router();
  router.use(routes);
  return router;
}
