import { Router } from 'express';
import routes from './dedup.routes.js';
import { registerDedupHandlers } from './dedup.events.js';

export function initDedupModule() {
  registerDedupHandlers();
}

export default function dedupModule() {
  const router = Router();
  router.use(routes);
  return router;
}
