import { Router } from 'express';
import routes from './teams.routes.js';
import { registerTeamHandlers } from './teams.events.js';

export function initTeamsModule() {
  registerTeamHandlers();
}

export default function teamsModule() {
  const router = Router();
  router.use(routes);
  return router;
}
