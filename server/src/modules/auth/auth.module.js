import { Router } from 'express';
import routes from './auth.routes.js';
import { registerAuthHandlers } from './auth.events.js';

export function initAuthModule() {
  registerAuthHandlers();
}

export default function authModule() {
  const router = Router();
  router.use(routes);
  return router;
}
