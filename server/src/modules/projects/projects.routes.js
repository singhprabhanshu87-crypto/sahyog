import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './projects.controller.js';
import projectsPolicy from './projects.policy.js';
import * as service from './projects.service.js';
import { createProjectSchema, projectIdParamsSchema } from './projects.validation.js';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize({ policy: projectsPolicy, action: 'create' }),
  validate(createProjectSchema),
  asyncHandler(controller.createProject),
);

router.get(
  '/:id',
  authenticate(),
  authorize({
    policy: projectsPolicy,
    action: 'read',
    getResource: async (req) => service.findById(req.params.id).catch(() => null),
  }),
  validate(projectIdParamsSchema),
  asyncHandler(controller.getProject),
);

export default router;
