import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './agreements.controller.js';
import agreementsPolicy from './agreements.policy.js';
import {
  createAgreementSchema,
  agreementIdParamsSchema,
  signAgreementSchema,
} from './agreements.validation.js';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize({ policy: agreementsPolicy, action: 'create' }),
  validate(createAgreementSchema),
  asyncHandler(controller.createAgreement),
);

router.post(
  '/:id/sign',
  authenticate(),
  authorize({ policy: agreementsPolicy, action: 'sign' }),
  validate(signAgreementSchema),
  asyncHandler(controller.signAgreement),
);

export default router;
