import * as service from './agreements.service.js';
import agreementsPolicy, { projectAgreement } from './agreements.policy.js';

export async function createAgreement(req, res) {
  const agreement = await service.create(req.body, req.user);
  res.status(201).json({ data: projectAgreement(agreement, req.projection || 'assignee') });
}

export async function signAgreement(req, res) {
  const agreement = await service.sign(req.params.id, req.body, req.user);
  res.json({ data: projectAgreement(agreement, req.projection || 'assignee') });
}

export default { createAgreement, signAgreement };
