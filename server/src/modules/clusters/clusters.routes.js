import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './clusters.controller.js';
import clustersPolicy from './clusters.policy.js';
import * as clustersService from './clusters.service.js';
import { listClustersSchema, clusterIdParamsSchema } from './clusters.validation.js';

const router = Router();

router.get(
  '/',
  authenticate(),
  authorize({ policy: clustersPolicy, action: 'list' }),
  validate(listClustersSchema),
  asyncHandler(controller.listClusters),
);

router.get(
  '/:id',
  authenticate(),
  authorize({
    policy: clustersPolicy,
    action: 'read',
    getResource: async (req) => clustersService.findById(req.params.id).catch(() => null),
  }),
  validate(clusterIdParamsSchema),
  asyncHandler(controller.getCluster),
);

export default router;
