import * as service from './teams.service.js';
import teamsPolicy, { projectTeam } from './teams.policy.js';

export async function createTeam(req, res) {
  const team = await service.create(req.body, req.user);
  res.status(201).json({ data: projectTeam(team, req.projection || 'assignee') });
}

export async function getTeam(req, res) {
  const team = await service.findById(req.params.id);
  res.json({ data: projectTeam(team, req.projection || 'assignee') });
}

export async function patchMembers(req, res) {
  const team = await service.patchMembers(req.params.id, req.body, req.user);
  res.json({ data: projectTeam(team, req.projection || 'internal') });
}

export default { createTeam, getTeam, patchMembers };
