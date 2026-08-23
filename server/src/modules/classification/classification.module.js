import { Router } from 'express';
import routes from './classification.routes.js';
import { registerClassificationHandlers } from './classification.events.js';

export function initClassificationModule() {
  registerClassificationHandlers();
}

export default function classificationModule() {
  const router = Router();
  router.use(routes);
  return router;
}
