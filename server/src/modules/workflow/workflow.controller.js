import * as service from './workflow.service.js';
import workflowPolicy, { projectWorkflow } from './workflow.policy.js';

export async function getWorkflow(req, res) {
  const instance = await service.getOrCreate(req.params.challengeId);
  res.json({ data: projectWorkflow(instance, req.projection || 'assignee') });
}

export async function transitionWorkflow(req, res) {
  const instance = await service.transition(
    req.params.challengeId,
    req.body.event,
    req.user,
    { rationale: req.body.rationale },
  );
  res.json({ data: projectWorkflow(instance, req.projection || 'assignee') });
}

export default { getWorkflow, transitionWorkflow };
