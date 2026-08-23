import * as orgsService from './organizations.service.js';
import organizationsPolicy, { projectOrganization } from './organizations.policy.js';

export async function createOrg(req, res) {
  const org = await orgsService.create(req.body, req.user.id);
  res.status(201).json({ data: projectOrganization(org, 'assignee') });
}

export async function getOrg(req, res) {
  const org = await orgsService.findById(req.params.id);
  res.json({ data: projectOrganization(org, req.projection || 'public') });
}

export async function updateOrg(req, res) {
  const org = await orgsService.update(req.params.id, req.body, req.user);
  res.json({ data: projectOrganization(org, req.projection || 'assignee') });
}

export async function listOrgs(req, res) {
  const result = await orgsService.list(req.query);
  res.json({
    data: result.data.map((o) => projectOrganization(o, req.projection || 'public')),
    pagination: result.pagination,
  });
}

export async function verifyOrg(req, res) {
  const org = await orgsService.transitionVerification(
    req.params.id,
    req.body.action,
    req.user,
    { reason: req.body.reason },
  );
  res.json({ data: projectOrganization(org, 'internal') });
}

export default { createOrg, getOrg, updateOrg, listOrgs, verifyOrg };
