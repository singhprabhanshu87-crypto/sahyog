import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './challenges.controller.js';
import challengesPolicy from './challenges.policy.js';
import * as service from './challenges.service.js';
import {
  createChallengeSchema,
  challengeIdParamsSchema,
  listChallengesSchema,
  patchScopeSchema,
} from './challenges.validation.js';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize({ policy: challengesPolicy, action: 'create' }),
  validate(createChallengeSchema),
  asyncHandler(controller.createChallenge),
);

router.get(
  '/',
  authenticate({ optional: true }),
  authorize({ policy: challengesPolicy, action: 'list', optional: true }),
  validate(listChallengesSchema),
  asyncHandler(controller.listChallenges),
);

router.get(
  '/:id',
  authenticate({ optional: true }),
  authorize({
    policy: challengesPolicy,
    action: 'read',
    optional: true,
    getResource: async (req) => service.findById(req.params.id).catch(() => null),
  }),
  validate(challengeIdParamsSchema),
  asyncHandler(controller.getChallenge),
);

router.patch(
  '/:id/scope',
  authenticate(),
  authorize({
    policy: challengesPolicy,
    action: 'update_scope',
    getResource: async (req) => service.findById(req.params.id).catch(() => null),
  }),
  validate(patchScopeSchema),
  asyncHandler(controller.patchScope),
);

export default router;
