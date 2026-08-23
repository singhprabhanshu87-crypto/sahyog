import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './organizations.controller.js';
import organizationsPolicy from './organizations.policy.js';
import * as orgsService from './organizations.service.js';
import {
  createOrgSchema,
  updateOrgSchema,
  orgIdParamsSchema,
  listOrgsSchema,
  verifyOrgSchema,
} from './organizations.validation.js';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize({ policy: organizationsPolicy, action: 'create' }),
  validate(createOrgSchema),
  asyncHandler(controller.createOrg),
);

router.get(
  '/',
  authenticate({ optional: true }),
  authorize({ policy: organizationsPolicy, action: 'list', optional: true }),
  validate(listOrgsSchema),
  asyncHandler(controller.listOrgs),
);

router.get(
  '/:id',
  authenticate({ optional: true }),
  authorize({
    policy: organizationsPolicy,
    action: 'read',
    optional: true,
    getResource: async (req) => orgsService.findById(req.params.id).catch(() => null),
  }),
  validate(orgIdParamsSchema),
  asyncHandler(controller.getOrg),
);

router.patch(
  '/:id',
  authenticate(),
  authorize({
    policy: organizationsPolicy,
    action: 'update',
    getResource: async (req) => orgsService.findById(req.params.id).catch(() => null),
  }),
  validate(updateOrgSchema),
  asyncHandler(controller.updateOrg),
);

router.post(
  '/:id/verify',
  authenticate(),
  authorize({ policy: organizationsPolicy, action: 'verify' }),
  validate(verifyOrgSchema),
  asyncHandler(controller.verifyOrg),
);

export default router;
