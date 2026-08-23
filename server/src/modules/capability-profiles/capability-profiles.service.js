import { CapabilityProfile } from './capability-profiles.schema.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError } from '../../common/errors/http-errors.js';

export async function findByOrgId(orgId) {
  const profile = await CapabilityProfile.findOne({ orgId }).lean();
  if (!profile) throw new NotFoundError('Capability profile not found');
  return profile;
}

export async function upsert(orgId, data, actor) {
  const update = { ...data, updatedBy: actor.id };

  if (data.selfDeclaration) {
    update.selfDeclaration = {
      ...data.selfDeclaration,
      declaredAt: new Date(),
      declaredBy: actor.id,
    };
  }

  if (data.enrichment) {
    update.enrichment = {
      ...data.enrichment,
      enrichedAt: new Date(),
    };
  }

  const existed = await CapabilityProfile.exists({ orgId });

  const profile = await CapabilityProfile.findOneAndUpdate(
    { orgId },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: existed ? 'capability_profile.updated' : 'capability_profile.created',
    resourceType: 'capability_profile',
    resourceId: profile._id.toString(),
    payload: { orgId },
  });

  return profile;
}

export async function patch(orgId, data, actor) {
  const existing = await CapabilityProfile.findOne({ orgId });
  if (!existing) throw new NotFoundError('Capability profile not found');

  const patchData = { ...data, updatedBy: actor.id };

  if (data.selfDeclaration) {
    patchData.selfDeclaration = {
      ...existing.selfDeclaration?.toObject?.() ?? existing.selfDeclaration ?? {},
      ...data.selfDeclaration,
      declaredAt: new Date(),
      declaredBy: actor.id,
    };
  }

  if (data.enrichment) {
    patchData.enrichment = {
      ...existing.enrichment?.toObject?.() ?? existing.enrichment ?? {},
      ...data.enrichment,
      enrichedAt: new Date(),
    };
  }

  if (data.axes) {
    patchData.axes = {
      ...existing.axes?.toObject?.() ?? existing.axes ?? {},
      ...data.axes,
    };
  }

  const profile = await CapabilityProfile.findOneAndUpdate(
    { orgId },
    { $set: patchData },
    { new: true },
  ).lean();

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'capability_profile.updated',
    resourceType: 'capability_profile',
    resourceId: profile._id.toString(),
    payload: { orgId, fields: Object.keys(data) },
  });

  return profile;
}

export default { findByOrgId, upsert, patch };
