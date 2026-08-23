import AppError from './app-error.js';

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details = null) {
    super(message, { statusCode: 400, code: 'BAD_REQUEST', details });
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, { statusCode: 401, code: 'UNAUTHORIZED', details });
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details = null) {
    super(message, { statusCode: 403, code: 'FORBIDDEN', details });
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, { statusCode: 404, code: 'NOT_FOUND', details });
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details = null) {
    super(message, { statusCode: 409, code: 'CONFLICT', details });
    this.name = 'ConflictError';
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, { statusCode: 422, code: 'VALIDATION_ERROR', details });
    this.name = 'ValidationError';
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests', details = null) {
    super(message, { statusCode: 429, code: 'TOO_MANY_REQUESTS', details });
    this.name = 'TooManyRequestsError';
  }
}

export default {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
};
