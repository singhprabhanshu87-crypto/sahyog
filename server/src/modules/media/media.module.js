import { Router } from 'express';
import routes from './media.routes.js';
import { registerMediaHandlers } from './media.events.js';

export function initMediaModule() {
  registerMediaHandlers();
}

export default function mediaModule() {
  const router = Router();
  router.use(routes);
  return router;
}
