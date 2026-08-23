import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './integrations.controller.js';
import integrationsPolicy from './integrations.policy.js';
import { forwardGrievanceSchema } from './integrations.validation.js';

const router = Router();

router.post(
  '/grievance/forward',
  authenticate(),
  authorize({ policy: integrationsPolicy, action: 'forward_grievance' }),
  validate(forwardGrievanceSchema),
  asyncHandler(controller.forwardGrievance),
);

export default router;
