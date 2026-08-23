import { Router } from 'express';
import routes from './disputes.routes.js';
import { registerDisputeHandlers } from './disputes.events.js';

export function initDisputesModule() {
  registerDisputeHandlers();
}

export default function disputesModule() {
  const router = Router();
  router.use(routes);
  return router;
}
