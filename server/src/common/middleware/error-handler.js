import { ZodError } from 'zod';
import AppError from '../errors/app-error.js';
import logger from '../lib/logger.js';
import config from '../../config/index.js';

export function errorHandler(err, req, res, _next) {
  const requestId = req.context?.requestId;

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err, requestId }, 'Non-operational error');
    }
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
        ...(requestId && { requestId }),
      },
    });
  }

  if (err instanceof ZodError) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          issues: err.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        ...(requestId && { requestId }),
      },
    });
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'Duplicate key violation',
        ...(requestId && { requestId }),
      },
    });
  }

  logger.error({ err, requestId }, 'Unhandled error');

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: config.isProd ? 'Internal server error' : err.message,
      ...(requestId && { requestId }),
    },
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      requestId: req.context?.requestId,
    },
  });
}

export default { errorHandler, notFoundHandler };
