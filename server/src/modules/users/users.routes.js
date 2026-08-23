import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './users.controller.js';
import usersPolicy from './users.policy.js';
import * as usersService from './users.service.js';
import {
  updateProfileSchema,
  userIdParamsSchema,
  createMembershipSchema,
  listUsersSchema,
} from './users.validation.js';

const router = Router();

router.get('/me', authenticate(), asyncHandler(controller.getMe));
router.patch('/me', authenticate(), validate(updateProfileSchema), asyncHandler(controller.updateMe));

router.get(
  '/',
  authenticate(),
  authorize({ policy: usersPolicy, action: 'list' }),
  validate(listUsersSchema),
  asyncHandler(controller.listUsers),
);

router.get(
  '/:id',
  authenticate(),
  authorize({
    policy: usersPolicy,
    action: 'read',
    getResource: async (req) => usersService.findById(req.params.id).catch(() => null),
  }),
  validate(userIdParamsSchema),
  asyncHandler(controller.getUser),
);

router.get(
  '/:id/memberships',
  authenticate(),
  authorize({
    policy: usersPolicy,
    action: 'read',
    getResource: async (req) => usersService.findById(req.params.id).catch(() => null),
  }),
  validate(userIdParamsSchema),
  asyncHandler(controller.getUserMemberships),
);

router.post(
  '/memberships',
  authenticate(),
  authorize({ policy: usersPolicy, action: 'create' }),
  validate(createMembershipSchema),
  asyncHandler(controller.createMembership),
);

export default router;
