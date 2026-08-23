import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './geo.controller.js';
import geoPolicy from './geo.policy.js';
import { resolvePointSchema, listBoundariesSchema } from './geo.validation.js';

const router = Router();

router.post(
  '/resolve',
  authenticate({ optional: true }),
  authorize({ policy: geoPolicy, action: 'resolve', optional: true }),
  validate(resolvePointSchema),
  asyncHandler(controller.resolvePoint),
);

router.get(
  '/boundaries',
  authenticate({ optional: true }),
  authorize({ policy: geoPolicy, action: 'list', optional: true }),
  validate(listBoundariesSchema),
  asyncHandler(controller.listBoundaries),
);

export default router;
