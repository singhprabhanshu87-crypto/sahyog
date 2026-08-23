import { Router } from 'express';
import routes from './users.routes.js';
import { registerUserHandlers } from './users.events.js';

export function initUsersModule() {
  registerUserHandlers();
}

export default function usersModule() {
  const router = Router();
  router.use(routes);
  return router;
}
