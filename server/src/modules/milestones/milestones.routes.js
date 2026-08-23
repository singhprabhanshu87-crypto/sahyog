import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './milestones.controller.js';
import milestonesPolicy from './milestones.policy.js';
import * as service from './milestones.service.js';
import {
  milestoneIdParamsSchema,
  submitEvidenceSchema,
  reviewMilestoneSchema,
} from './milestones.validation.js';

const router = Router();

router.post(
  '/:id/submit-evidence',
  authenticate(),
  authorize({
    policy: milestonesPolicy,
    action: 'submit_evidence',
    getResource: async (req) => service.findById(req.params.id).catch(() => null),
  }),
  validate(submitEvidenceSchema),
  asyncHandler(controller.submitEvidence),
);

router.post(
  '/:id/review',
  authenticate(),
  authorize({
    policy: milestonesPolicy,
    action: 'review',
    getResource: async (req) => service.findById(req.params.id).catch(() => null),
  }),
  validate(reviewMilestoneSchema),
  asyncHandler(controller.reviewMilestone),
);

export default router;
