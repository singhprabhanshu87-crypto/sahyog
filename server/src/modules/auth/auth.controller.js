import * as authService from './auth.service.js';
import { projectAuth } from './auth.policy.js';
import { getContext } from '../../common/middleware/request-context.js';

function requestMeta(req) {
  const ctx = getContext();
  return {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    correlationId: ctx.correlationId,
  };
}

export async function requestOtp(req, res) {
  const result = await authService.requestOtp(req.body);
  res.json(result);
}

export async function verifyOtp(req, res) {
  const tokens = await authService.verifyOtp(req.body, requestMeta(req));
  res.json(projectAuth(tokens));
}

export async function login(req, res) {
  const tokens = await authService.loginWithPassword(req.body, requestMeta(req));
  res.json(projectAuth(tokens));
}

export async function refresh(req, res) {
  const tokens = await authService.refreshTokens(req.body, requestMeta(req));
  res.json(projectAuth(tokens));
}

export async function logout(req, res) {
  const result = await authService.logout({
    userId: req.user?.id,
    refreshToken: req.body.refreshToken,
  });
  res.json(result);
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export default { requestOtp, verifyOtp, login, refresh, logout, me };
