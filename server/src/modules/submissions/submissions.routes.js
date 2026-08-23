import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import { submitRateLimiter } from '../../common/middleware/rate-limit.js';
import * as controller from './submissions.controller.js';
import submissionsPolicy from './submissions.policy.js';
import {
  createSubmissionSchema,
  trackingIdParamsSchema,
  listSubmissionsSchema,
} from './submissions.validation.js';

const router = Router();

router.post(
  '/',
  submitRateLimiter,
  authenticate({ optional: true }),
  authorize({ policy: submissionsPolicy, action: 'create', optional: true }),
  validate(createSubmissionSchema),
  asyncHandler(controller.createSubmission),
);

router.get(
  '/track/:trackingId',
  validate(trackingIdParamsSchema),
  asyncHandler(controller.trackSubmission),
);

router.get(
  '/',
  authenticate(),
  authorize({ policy: submissionsPolicy, action: 'list' }),
  validate(listSubmissionsSchema),
  asyncHandler(controller.listSubmissions),
);

export default router;
