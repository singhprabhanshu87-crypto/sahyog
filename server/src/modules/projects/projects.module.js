import { Router } from 'express';
import routes from './projects.routes.js';
import { registerProjectHandlers } from './projects.events.js';

export function initProjectsModule() {
  registerProjectHandlers();
}

export default function projectsModule() {
  const router = Router();
  router.use(routes);
  return router;
}
