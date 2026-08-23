import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './classification.controller.js';
import classificationPolicy from './classification.policy.js';
import { listReviewQueueSchema, overrideSchema } from './classification.validation.js';

const router = Router();

router.get(
  '/review-queue',
  authenticate(),
  authorize({ policy: classificationPolicy, action: 'list' }),
  validate(listReviewQueueSchema),
  asyncHandler(controller.listReviewQueue),
);

router.post(
  '/:id/override',
  authenticate(),
  authorize({ policy: classificationPolicy, action: 'override' }),
  validate(overrideSchema),
  asyncHandler(controller.overrideClassification),
);

export default router;
