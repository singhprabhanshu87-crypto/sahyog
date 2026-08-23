import * as service from './milestones.service.js';
import milestonesPolicy, { projectMilestone } from './milestones.policy.js';

export async function submitEvidence(req, res) {
  const milestone = await service.submitEvidence(req.params.id, req.body, req.user);
  res.json({ data: projectMilestone(milestone, req.projection || 'assignee') });
}

export async function reviewMilestone(req, res) {
  const milestone = await service.review(req.params.id, req.body, req.user);
  res.json({ data: projectMilestone(milestone, req.projection || 'internal') });
}

export default { submitEvidence, reviewMilestone };
