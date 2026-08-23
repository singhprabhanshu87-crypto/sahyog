import { Router } from 'express';
import routes from './geo.routes.js';
import { registerGeoHandlers } from './geo.events.js';
import { seedStubBoundaries } from './geo.service.js';

export function initGeoModule() {
  registerGeoHandlers();
  seedStubBoundaries().catch(() => {});
}

export default function geoModule() {
  const router = Router();
  router.use(routes);
  return router;
}
