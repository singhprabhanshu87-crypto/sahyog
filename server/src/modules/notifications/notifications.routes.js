import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import authorize from '../../common/middleware/authorize.js';
import validate from '../../common/middleware/validate.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './notifications.controller.js';
import notificationsPolicy from './notifications.policy.js';
import { listNotificationsSchema, patchPrefsSchema } from './notifications.validation.js';

const router = Router();

router.get(
  '/',
  authenticate(),
  authorize({ policy: notificationsPolicy, action: 'list' }),
  validate(listNotificationsSchema),
  asyncHandler(controller.listNotifications),
);

router.patch(
  '/prefs',
  authenticate(),
  authorize({ policy: notificationsPolicy, action: 'update_prefs' }),
  validate(patchPrefsSchema),
  asyncHandler(controller.patchPrefs),
);

export default router;
