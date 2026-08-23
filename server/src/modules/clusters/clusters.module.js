import { Router } from 'express';
import routes from './clusters.routes.js';
import { registerClusterHandlers } from './clusters.events.js';

export function initClustersModule() {
  registerClusterHandlers();
}

export default function clustersModule() {
  const router = Router();
  router.use(routes);
  return router;
}
