import { evaluatePolicy, assertPolicyAllowed } from '../lib/policy-engine.js';
import { ForbiddenError } from '../errors/http-errors.js';

/**
 * ABAC authorization gate — consults a module's policy.
 * Usage: authorize({ policy, action, getResource: (req) => ... })
 */
export function authorize({ policy, action, getResource, optional = false } = {}) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        if (optional) {
          req.projection = 'public';
          return next();
        }
        return next(new ForbiddenError('Authentication required'));
      }

      const resource = getResource ? await getResource(req) : req.resource ?? null;

      const result = await evaluatePolicy({
        policy,
        actor: req.user,
        resource,
        action,
        context: {
          req,
          params: req.params,
          query: req.query,
          body: req.body,
        },
      });

      assertPolicyAllowed(result);
      req.resource = resource;
      req.projection = result.projection;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export default authorize;
