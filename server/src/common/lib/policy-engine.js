import { ForbiddenError } from '../errors/http-errors.js';

/**
 * Evaluates ABAC rules from a module's x.policy.js.
 * A rule is a predicate over (actor, resource, action, context).
 */
export async function evaluatePolicy({ policy, actor, resource, action, context = {} }) {
  if (!policy) {
    return { allowed: false, reason: 'No policy defined' };
  }

  if (typeof policy.can === 'function') {
    const result = await policy.can({ actor, resource, action, context });
    if (typeof result === 'boolean') {
      return { allowed: result, reason: result ? null : 'Policy denied access' };
    }
    return result;
  }

  const rules = policy.rules || [];
  for (const rule of rules) {
    const matches = await rule.match({ actor, resource, action, context });
    if (matches) {
      const allowed = await rule.allow({ actor, resource, action, context });
      return {
        allowed: Boolean(allowed),
        reason: allowed ? null : rule.reason || 'Policy rule denied access',
      };
    }
  }

  return { allowed: false, reason: 'No matching policy rule' };
}

export function assertPolicyAllowed(result) {
  if (!result.allowed) {
    throw new ForbiddenError(result.reason || 'Access denied');
  }
}

/** Built-in ABAC helpers referenced in architecture §5.3 */
export const abacHelpers = {
  districtScope(actor, resource) {
    if (!actor?.districts?.length) return true;
    if (!resource?.districtCode) return false;
    return actor.districts.includes(resource.districtCode);
  },

  orgAssignment(actor, resource) {
    if (!actor?.orgId) return false;
    return resource?.assignedOrgId === actor.orgId || resource?.orgId === actor.orgId;
  },

  openPoolEligible(actor, resource) {
    if (!resource?.inOpenPool) return false;
    return actor?.eligibleForOpenPool === true;
  },

  industryOnboarded(actor, resource) {
    if (!actor?.onboardedProjects?.length) return false;
    return actor.onboardedProjects.includes(resource?.projectId);
  },

  hasSignedAgreement(actor) {
    return actor?.agreementSigned === true;
  },

  hasConflictOfInterest(actor, resource) {
    if (!actor?.orgId || !resource?.conflictOrgIds?.length) return false;
    return resource.conflictOrgIds.includes(actor.orgId);
  },
};

export default { evaluatePolicy, assertPolicyAllowed, abacHelpers };
