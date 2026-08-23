import { Router } from 'express';
import routes from './taxonomy.routes.js';
import { registerTaxonomyHandlers } from './taxonomy.events.js';
import { ensureSeed } from './taxonomy.service.js';

export function initTaxonomyModule() {
  registerTaxonomyHandlers();
  ensureSeed().catch(() => {});
}

export default function taxonomyModule() {
  const router = Router();
  router.use(routes);
  return router;
}
