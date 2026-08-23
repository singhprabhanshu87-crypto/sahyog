import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './matching.controller.js';
import matchingPolicy from './matching.policy.js';
import { challengeIdParamsSchema, runMatchSchema } from './matching.validation.js';

const router = Router();

router.post(
  '/run/:challengeId',
  authenticate(),
  authorize({ policy: matchingPolicy, action: 'run' }),
  validate(runMatchSchema),
  asyncHandler(controller.runMatch),
);

router.get(
  '/:challengeId',
  authenticate(),
  authorize({ policy: matchingPolicy, action: 'read' }),
  validate(challengeIdParamsSchema),
  asyncHandler(controller.getMatch),
);

export default router;
