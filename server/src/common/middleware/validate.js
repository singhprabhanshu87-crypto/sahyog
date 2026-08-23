import { ZodError } from 'zod';
import { ValidationError } from '../errors/http-errors.js';

export function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body ?? {});
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params ?? {});
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query ?? {});
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(
          new ValidationError('Request validation failed', {
            issues: err.issues.map((i) => ({
              path: i.path.join('.'),
              message: i.message,
            })),
          }),
        );
        return;
      }
      next(err);
    }
  };
}

export default validate;
