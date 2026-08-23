import jwt from 'jsonwebtoken';
import config from '../../config/index.js';
import { UnauthorizedError } from '../errors/http-errors.js';
import { setActor } from './request-context.js';

export function authenticate({ optional = false } = {}) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      if (optional) return next();
      return next(new UnauthorizedError('Missing or invalid authorization header'));
    }

    const token = header.slice(7);

    try {
      const payload = jwt.verify(token, config.JWT_ACCESS_SECRET);
      req.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        orgId: payload.orgId ?? null,
        districts: payload.districts ?? [],
        sessionId: payload.sessionId,
      };
      setActor(req.user);
      next();
    } catch {
      if (optional) return next();
      next(new UnauthorizedError('Invalid or expired access token'));
    }
  };
}

export default authenticate;
