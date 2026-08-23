import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './jobs.controller.js';
import jobsPolicy from './jobs.policy.js';
import { queueStatusSchema } from './jobs.validation.js';

const router = Router();

router.get(
  '/status',
  authenticate(),
  authorize({ policy: jobsPolicy, action: 'status' }),
  validate(queueStatusSchema),
  asyncHandler(controller.getQueueStatus),
);

export default router;
