import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './capability-profiles.controller.js';
import capabilityProfilesPolicy from './capability-profiles.policy.js';
import * as service from './capability-profiles.service.js';
import {
  orgIdParamsSchema,
  upsertProfileSchema,
  patchProfileSchema,
} from './capability-profiles.validation.js';

const router = Router();

router.get(
  '/:orgId',
  authenticate(),
  authorize({
    policy: capabilityProfilesPolicy,
    action: 'read',
    getResource: async (req) => service.findByOrgId(req.params.orgId).catch(() => null),
  }),
  validate(orgIdParamsSchema),
  asyncHandler(controller.getProfile),
);

router.post(
  '/:orgId',
  authenticate(),
  authorize({ policy: capabilityProfilesPolicy, action: 'create' }),
  validate(upsertProfileSchema),
  asyncHandler(controller.createProfile),
);

router.patch(
  '/:orgId',
  authenticate(),
  authorize({
    policy: capabilityProfilesPolicy,
    action: 'update',
    getResource: async (req) => service.findByOrgId(req.params.orgId).catch(() => null),
  }),
  validate(patchProfileSchema),
  asyncHandler(controller.updateProfile),
);

export default router;
