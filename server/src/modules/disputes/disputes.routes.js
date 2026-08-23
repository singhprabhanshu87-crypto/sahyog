import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './disputes.controller.js';
import disputesPolicy from './disputes.policy.js';
import {
  createDisputeSchema,
  disputeIdParamsSchema,
  escalateDisputeSchema,
} from './disputes.validation.js';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize({ policy: disputesPolicy, action: 'create' }),
  validate(createDisputeSchema),
  asyncHandler(controller.createDispute),
);

router.post(
  '/:id/escalate',
  authenticate(),
  authorize({ policy: disputesPolicy, action: 'escalate' }),
  validate(escalateDisputeSchema),
  asyncHandler(controller.escalateDispute),
);

export default router;
