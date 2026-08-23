import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { addMinutes, addDays } from 'date-fns';
import config from '../../config/index.js';
import { publish } from '../../common/lib/event-bus.js';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../../common/errors/http-errors.js';
import { Otp, Session } from './auth.schema.js';
import { OTP_PURPOSES, SESSION_STATUS } from './auth.constants.js';
import { ROLES } from '../../config/constants.js';
import * as usersService from '../users/users.service.js';
import logger from '../../common/lib/logger.js';

export async function requestOtp({ email, purpose = OTP_PURPOSES.LOGIN }) {
  const normalizedEmail = email.toLowerCase().trim();
  const code = generateOtpCode();
  const codeHash = await bcrypt.hash(code, config.BCRYPT_ROUNDS);

  await Otp.deleteMany({ email: normalizedEmail, purpose, consumedAt: null });

  await Otp.create({
    email: normalizedEmail,
    code: codeHash,
    purpose,
    expiresAt: addMinutes(new Date(), config.OTP_EXPIRY_MINUTES),
  });

  // Email delivery via integrations in later phases — log in dev
  if (config.isDev) {
    logger.info({ email: normalizedEmail, code }, 'OTP generated (dev only)');
  } else {
    logger.info({ email: normalizedEmail }, 'OTP requested — email delivery stub');
  }

  return { message: 'OTP sent to email', expiresInMinutes: config.OTP_EXPIRY_MINUTES };
}

export async function verifyOtp({ email, code, purpose = OTP_PURPOSES.LOGIN }, meta = {}) {
  const normalizedEmail = email.toLowerCase().trim();
  const otp = await Otp.findOne({
    email: normalizedEmail,
    purpose,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otp) {
    throw new BadRequestError('OTP expired or not found');
  }

  if (otp.attempts >= 5) {
    throw new BadRequestError('Too many OTP attempts — request a new code');
  }

  const valid = await bcrypt.compare(code, otp.code);
  if (!valid) {
    otp.attempts += 1;
    await otp.save();
    throw new BadRequestError('Invalid OTP');
  }

  otp.consumedAt = new Date();
  await otp.save();

  let user = await usersService.findByEmail(normalizedEmail);
  if (!user) {
    user = await usersService.create({
      email: normalizedEmail,
      name: normalizedEmail.split('@')[0],
      role: ROLES.CITIZEN,
      emailVerified: true,
    });
  } else if (!user.emailVerified) {
    user = await usersService.update(user._id, { emailVerified: true });
  }

  const tokens = await issueTokens(user, meta);

  await publish({
    actor: { id: user._id.toString(), type: 'user', email: user.email, role: user.role },
    action: 'auth.logged_in',
    resourceType: 'auth',
    resourceId: user._id.toString(),
    payload: { channel: 'email_otp', purpose },
    correlationId: meta.correlationId,
  });

  return tokens;
}

export async function loginWithPassword({ email, password }, meta = {}) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await usersService.findByEmail(normalizedEmail);

  if (!user?.passwordHash) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const tokens = await issueTokens(user, meta);

  await publish({
    actor: { id: user._id.toString(), type: 'user', email: user.email, role: user.role },
    action: 'auth.logged_in',
    resourceType: 'auth',
    resourceId: user._id.toString(),
    payload: { channel: 'email_password' },
    correlationId: meta.correlationId,
  });

  return tokens;
}

export async function refreshTokens({ refreshToken }, meta = {}) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const session = await Session.findById(payload.sessionId);
  if (!session || session.status !== SESSION_STATUS.ACTIVE) {
    throw new UnauthorizedError('Session revoked or expired');
  }

  if (session.expiresAt < new Date()) {
    session.status = SESSION_STATUS.EXPIRED;
    await session.save();
    throw new UnauthorizedError('Session expired');
  }

  const tokenHash = hashToken(refreshToken);
  if (session.refreshTokenHash !== tokenHash) {
    session.status = SESSION_STATUS.REVOKED;
    session.revokedAt = new Date();
    await session.save();
    throw new UnauthorizedError('Refresh token reuse detected — session revoked');
  }

  const user = await usersService.findById(payload.sub);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  session.status = SESSION_STATUS.REVOKED;
  session.revokedAt = new Date();
  await session.save();

  return issueTokens(user, meta);
}

export async function logout({ userId, refreshToken }) {
  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
      const session = await Session.findById(payload.sessionId);
      if (session) {
        session.status = SESSION_STATUS.REVOKED;
        session.revokedAt = new Date();
        await session.save();
      }
    } catch {
      // ignore invalid token on logout
    }
  } else if (userId) {
    await Session.updateMany(
      { userId, status: SESSION_STATUS.ACTIVE },
      { status: SESSION_STATUS.REVOKED, revokedAt: new Date() },
    );
  }

  if (userId) {
    await publish({
      actor: { id: userId, type: 'user' },
      action: 'auth.logged_out',
      resourceType: 'auth',
      resourceId: userId,
      payload: {},
    });
  }

  return { message: 'Logged out' };
}

export async function setPassword(userId, password) {
  const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
  return usersService.update(userId, { passwordHash });
}

async function issueTokens(user, meta = {}) {
  const session = await Session.create({
    userId: user._id,
    refreshTokenHash: 'pending',
    userAgent: meta.userAgent ?? null,
    ip: meta.ip ?? null,
    expiresAt: parseExpiry(config.JWT_REFRESH_EXPIRY),
  });

  const accessPayload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    orgId: user.primaryOrgId?.toString?.() ?? null,
    districts: user.districts ?? [],
    sessionId: session._id.toString(),
  };

  const refreshPayload = {
    sub: user._id.toString(),
    sessionId: session._id.toString(),
  };

  const accessToken = jwt.sign(accessPayload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRY,
  });

  const refreshToken = jwt.sign(refreshPayload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRY,
  });

  session.refreshTokenHash = hashToken(refreshToken);
  await session.save();

  return {
    accessToken,
    refreshToken,
    expiresIn: config.JWT_ACCESS_EXPIRY,
    sessionId: session._id.toString(),
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.primaryOrgId?.toString?.() ?? null,
    },
  };
}

function generateOtpCode() {
  const max = 10 ** config.OTP_LENGTH;
  const num = crypto.randomInt(0, max);
  return String(num).padStart(config.OTP_LENGTH, '0');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function parseExpiry(expiry) {
  const match = /^(\d+)([dmh])$/.exec(expiry);
  if (!match) return addDays(new Date(), 7);
  const value = Number(match[1]);
  const unit = match[2];
  if (unit === 'm') return addMinutes(new Date(), value);
  if (unit === 'h') return addMinutes(new Date(), value * 60);
  return addDays(new Date(), value);
}

export default {
  requestOtp,
  verifyOtp,
  loginWithPassword,
  refreshTokens,
  logout,
  setPassword,
};
