import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './teams.controller.js';
import teamsPolicy from './teams.policy.js';
import * as service from './teams.service.js';
import { createTeamSchema, teamIdParamsSchema, patchMembersSchema } from './teams.validation.js';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize({ policy: teamsPolicy, action: 'create' }),
  validate(createTeamSchema),
  asyncHandler(controller.createTeam),
);

router.get(
  '/:id',
  authenticate(),
  authorize({
    policy: teamsPolicy,
    action: 'read',
    getResource: async (req) => service.findById(req.params.id).catch(() => null),
  }),
  validate(teamIdParamsSchema),
  asyncHandler(controller.getTeam),
);

router.patch(
  '/:id/members',
  authenticate(),
  authorize({
    policy: teamsPolicy,
    action: 'update_members',
    getResource: async (req) => service.findById(req.params.id).catch(() => null),
  }),
  validate(patchMembersSchema),
  asyncHandler(controller.patchMembers),
);

export default router;
