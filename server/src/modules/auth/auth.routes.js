import { Router } from 'express';
import authenticate from '../../common/middleware/authenticate.js';
import validate from '../../common/middleware/validate.js';
import { authRateLimiter } from '../../common/middleware/rate-limit.js';
import asyncHandler from '../../common/utils/async-handler.js';
import * as controller from './auth.controller.js';
import {
  requestOtpSchema,
  verifyOtpSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from './auth.validation.js';

const router = Router();

router.post('/otp/request', authRateLimiter, validate(requestOtpSchema), asyncHandler(controller.requestOtp));
router.post('/otp/verify', authRateLimiter, validate(verifyOtpSchema), asyncHandler(controller.verifyOtp));
router.post('/login', authRateLimiter, validate(loginSchema), asyncHandler(controller.login));
router.post('/refresh', validate(refreshSchema), asyncHandler(controller.refresh));
router.post('/logout', authenticate({ optional: true }), validate(logoutSchema), asyncHandler(controller.logout));
router.get('/me', authenticate(), asyncHandler(controller.me));

export default router;
