import * as service from './capability-profiles.service.js';
import capabilityProfilesPolicy, { projectCapabilityProfile } from './capability-profiles.policy.js';

export async function getProfile(req, res) {
  const profile = await service.findByOrgId(req.params.orgId);
  res.json({ data: projectCapabilityProfile(profile, req.projection || 'assignee') });
}

export async function createProfile(req, res) {
  const profile = await service.upsert(req.params.orgId, req.body, req.user);
  res.status(201).json({ data: projectCapabilityProfile(profile, req.projection || 'assignee') });
}

export async function updateProfile(req, res) {
  const profile = await service.patch(req.params.orgId, req.body, req.user);
  res.json({ data: projectCapabilityProfile(profile, req.projection || 'assignee') });
}

export default { getProfile, createProfile, updateProfile };
