import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './claims.controller.js';
import claimsPolicy from './claims.policy.js';
import * as service from './claims.service.js';
import {
  createClaimSchema,
  claimIdParamsSchema,
  listClaimsSchema,
  releaseClaimSchema,
} from './claims.validation.js';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize({ policy: claimsPolicy, action: 'create' }),
  validate(createClaimSchema),
  asyncHandler(controller.createClaim),
);

router.get(
  '/',
  authenticate(),
  authorize({ policy: claimsPolicy, action: 'list' }),
  validate(listClaimsSchema),
  asyncHandler(controller.listClaims),
);

router.post(
  '/:id/release',
  authenticate(),
  authorize({
    policy: claimsPolicy,
    action: 'release',
    getResource: async (req) => service.findById(req.params.id).catch(() => null),
  }),
  validate(releaseClaimSchema),
  asyncHandler(controller.releaseClaim),
);

export default router;
