import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './validation.controller.js';
import validationPolicy from './validation.policy.js';
import { challengeIdParamsSchema, signOffSchema } from './validation.validation.js';

const router = Router();

router.post(
  '/:challengeId/sign-off',
  authenticate(),
  authorize({ policy: validationPolicy, action: 'sign_off' }),
  validate(signOffSchema),
  asyncHandler(controller.signOff),
);

export default router;
