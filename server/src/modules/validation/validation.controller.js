import * as service from './validation.service.js';
import validationPolicy, { projectValidation } from './validation.policy.js';

export async function signOff(req, res) {
  const record = await service.signOff(req.params.challengeId, req.body, req.user);
  res.json({ data: projectValidation(record, req.projection || 'assignee') });
}

export default { signOff };
