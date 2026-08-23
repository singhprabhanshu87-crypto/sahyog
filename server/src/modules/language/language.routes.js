import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './language.controller.js';
import languagePolicy from './language.policy.js';
import { detectSchema, translateSchema } from './language.validation.js';

const router = Router();

router.post(
  '/detect',
  authenticate(),
  authorize({ policy: languagePolicy, action: 'detect' }),
  validate(detectSchema),
  asyncHandler(controller.detectLanguage),
);

router.post(
  '/translate',
  authenticate(),
  authorize({ policy: languagePolicy, action: 'translate' }),
  validate(translateSchema),
  asyncHandler(controller.translateText),
);

export default router;
