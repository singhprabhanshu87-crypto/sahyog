import { Router } from 'express';
import routes from './validation.routes.js';
import { registerValidationHandlers } from './validation.events.js';

export function initValidationModule() {
  registerValidationHandlers();
}

export default function validationModule() {
  const router = Router();
  router.use(routes);
  return router;
}
