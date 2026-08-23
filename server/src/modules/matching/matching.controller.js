import * as service from './matching.service.js';
import matchingPolicy, { projectMatchRun } from './matching.policy.js';

export async function runMatch(req, res) {
  const run = await service.runMatch(req.params.challengeId, req.user, req.body ?? {});
  res.status(201).json({ data: projectMatchRun(run, req.projection || 'internal') });
}

export async function getMatch(req, res) {
  const run = await service.getLatestRun(req.params.challengeId);
  const rationales = await service.getRationales(run._id);
  res.json({
    data: projectMatchRun(run, req.projection || 'assignee'),
    rationales,
  });
}

export default { runMatch, getMatch };
