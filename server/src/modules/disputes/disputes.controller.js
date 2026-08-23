import * as service from './disputes.service.js';
import disputesPolicy, { projectDispute } from './disputes.policy.js';

export async function createDispute(req, res) {
  const dispute = await service.create(req.body, req.user);
  res.status(201).json({ data: projectDispute(dispute, req.projection || 'assignee') });
}

export async function escalateDispute(req, res) {
  const dispute = await service.escalate(req.params.id, req.body, req.user);
  res.json({ data: projectDispute(dispute, req.projection || 'internal') });
}

export default { createDispute, escalateDispute };
