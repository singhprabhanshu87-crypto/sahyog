import { Router } from 'express';
import routes from './challenges.routes.js';
import { registerChallengeHandlers } from './challenges.events.js';

export function initChallengesModule() {
  registerChallengeHandlers();
}

export default function challengesModule() {
  const router = Router();
  router.use(routes);
  return router;
}
