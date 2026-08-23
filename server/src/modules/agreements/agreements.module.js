import { Router } from 'express';
import routes from './agreements.routes.js';
import { registerAgreementHandlers } from './agreements.events.js';

export function initAgreementsModule() {
  registerAgreementHandlers();
}

export default function agreementsModule() {
  const router = Router();
  router.use(routes);
  return router;
}
