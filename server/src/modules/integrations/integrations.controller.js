import * as service from './integrations.service.js';
import integrationsPolicy, { projectIntegrationLog } from './integrations.policy.js';

export async function forwardGrievance(req, res) {
  const log = await service.forwardGrievance(req.body, req.user);
  res.status(201).json({ data: projectIntegrationLog(log, req.projection || 'internal') });
}

export default { forwardGrievance };
