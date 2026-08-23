import * as service from './challenges.service.js';
import challengesPolicy, { projectChallenge } from './challenges.policy.js';

export async function createChallenge(req, res) {
  const challenge = await service.create(req.body, req.user.id);
  res.status(201).json({ data: projectChallenge(challenge, req.projection || 'assignee') });
}

export async function getChallenge(req, res) {
  const challenge = await service.findById(req.params.id);
  res.json({ data: projectChallenge(challenge, req.projection || 'public') });
}

export async function listChallenges(req, res) {
  const result = await service.list(req.query);
  res.json({
    data: result.data.map((c) => projectChallenge(c, req.projection || 'public')),
    pagination: result.pagination,
  });
}

export async function patchScope(req, res) {
  const challenge = await service.patchScope(req.params.id, req.body, req.user);
  res.json({ data: projectChallenge(challenge, req.projection || 'internal') });
}

export default { createChallenge, getChallenge, listChallenges, patchScope };
