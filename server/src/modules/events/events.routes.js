import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './events.controller.js';
import eventsPolicy from './events.policy.js';
import { queryEventsSchema, resourceParamsSchema } from './events.validation.js';

const router = Router();

router.get(
  '/',
  authenticate(),
  authorize({ policy: eventsPolicy, action: 'list' }),
  validate(queryEventsSchema),
  asyncHandler(controller.listEvents),
);

router.get(
  '/resource/:resourceType/:resourceId',
  authenticate(),
  authorize({ policy: eventsPolicy, action: 'read' }),
  validate(resourceParamsSchema),
  asyncHandler(controller.getResourceEvents),
);

export default router;
