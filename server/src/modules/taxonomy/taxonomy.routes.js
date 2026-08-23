import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './taxonomy.controller.js';
import taxonomyPolicy from './taxonomy.policy.js';
import { getTaxonomySchema, listDomainsSchema } from './taxonomy.validation.js';

const router = Router();

router.get(
  '/',
  authenticate({ optional: true }),
  authorize({ policy: taxonomyPolicy, action: 'read', optional: true }),
  validate(getTaxonomySchema),
  asyncHandler(controller.getTaxonomy),
);

router.get(
  '/domains',
  authenticate({ optional: true }),
  authorize({ policy: taxonomyPolicy, action: 'list', optional: true }),
  validate(listDomainsSchema),
  asyncHandler(controller.listDomains),
);

export default router;
