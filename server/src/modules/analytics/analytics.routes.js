import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './analytics.controller.js';
import analyticsPolicy from './analytics.policy.js';
import { dashboardQuerySchema, districtsQuerySchema } from './analytics.validation.js';

const router = Router();

router.get(
  '/dashboard',
  authenticate(),
  authorize({ policy: analyticsPolicy, action: 'read' }),
  validate(dashboardQuerySchema),
  asyncHandler(controller.getDashboard),
);

router.get(
  '/districts',
  authenticate(),
  authorize({ policy: analyticsPolicy, action: 'read' }),
  validate(districtsQuerySchema),
  asyncHandler(controller.getDistricts),
);

export default router;
