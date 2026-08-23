import { toAssignee, toInternal } from './integrations.mapper.js';

export const integrationsPolicy = {
  async can({ actor, action }) {
    if (!actor) {
      return { allowed: false, reason: 'Authentication required' };
    }

    if (action === 'forward_grievance') {
      return ['pmu_admin', 'district_officer', 'facilitator'].includes(actor.role)
        ? { allowed: true, projection: 'internal' }
        : { allowed: false, reason: 'Insufficient permissions' };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  },
};

export function projectIntegrationLog(log, level = 'internal') {
  return level === 'internal' ? toInternal(log) : toAssignee(log);
}

export default integrationsPolicy;
