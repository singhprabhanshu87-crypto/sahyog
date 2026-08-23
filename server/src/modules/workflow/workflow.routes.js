import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './workflow.controller.js';
import workflowPolicy from './workflow.policy.js';
import * as service from './workflow.service.js';
import { challengeIdParamsSchema, transitionSchema } from './workflow.validation.js';

const router = Router();

router.get(
  '/:challengeId',
  authenticate(),
  authorize({
    policy: workflowPolicy,
    action: 'read',
    getResource: async (req) => service.getOrCreate(req.params.challengeId).catch(() => null),
  }),
  validate(challengeIdParamsSchema),
  asyncHandler(controller.getWorkflow),
);

router.post(
  '/:challengeId/transition',
  authenticate(),
  authorize({ policy: workflowPolicy, action: 'transition' }),
  validate(transitionSchema),
  asyncHandler(controller.transitionWorkflow),
);

export default router;
