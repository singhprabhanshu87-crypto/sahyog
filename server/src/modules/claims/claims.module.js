import { Router } from 'express';
import routes from './claims.routes.js';
import { registerClaimHandlers } from './claims.events.js';

export function initClaimsModule() {
  registerClaimHandlers();
}

export default function claimsModule() {
  const router = Router();
  router.use(routes);
  return router;
}
