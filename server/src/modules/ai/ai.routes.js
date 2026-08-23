import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './ai.controller.js';
import aiPolicy from './ai.policy.js';
import { completeSchema } from './ai.validation.js';

const router = Router();

router.post(
  '/complete',
  authenticate(),
  authorize({ policy: aiPolicy, action: 'complete' }),
  validate(completeSchema),
  asyncHandler(controller.complete),
);

export default router;
