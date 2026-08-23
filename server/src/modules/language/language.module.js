import { Router } from 'express';
import routes from './language.routes.js';
import { registerLanguageHandlers } from './language.events.js';

export function initLanguageModule() {
  registerLanguageHandlers();
}

export default function languageModule() {
  const router = Router();
  router.use(routes);
  return router;
}
