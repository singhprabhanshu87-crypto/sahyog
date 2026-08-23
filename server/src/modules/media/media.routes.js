import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './media.controller.js';
import mediaPolicy from './media.policy.js';
import * as mediaService from './media.service.js';
import { createMediaSchema, mediaIdParamsSchema, listMediaSchema } from './media.validation.js';

const router = Router();

router.post(
  '/',
  authenticate(),
  authorize({ policy: mediaPolicy, action: 'create' }),
  validate(createMediaSchema),
  asyncHandler(controller.createMedia),
);

router.get(
  '/',
  authenticate(),
  authorize({ policy: mediaPolicy, action: 'read' }),
  validate(listMediaSchema),
  asyncHandler(controller.listMedia),
);

router.get(
  '/:id',
  authenticate(),
  authorize({
    policy: mediaPolicy,
    action: 'read',
    getResource: async (req) => mediaService.findById(req.params.id).catch(() => null),
  }),
  validate(mediaIdParamsSchema),
  asyncHandler(controller.getMedia),
);

router.get(
  '/:id/signed-url',
  authenticate(),
  authorize({
    policy: mediaPolicy,
    action: 'read',
    getResource: async (req) => mediaService.findById(req.params.id).catch(() => null),
  }),
  validate(mediaIdParamsSchema),
  asyncHandler(controller.getSignedUrl),
);

export default router;
