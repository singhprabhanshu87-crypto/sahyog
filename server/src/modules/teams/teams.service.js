import { Team } from './teams.schema.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError } from '../../common/errors/http-errors.js';

export async function create(data, actor) {
  const orgId = data.orgId ?? actor.orgId;
  const team = await Team.create({
    ...data,
    orgId,
    createdBy: actor.id,
  });

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'team.created',
    resourceType: 'team',
    resourceId: team._id.toString(),
    payload: { challengeId: data.challengeId, orgId },
  });

  return team.toObject();
}

export async function findById(id) {
  const team = await Team.findById(id).lean();
  if (!team) throw new NotFoundError('Team not found');
  return team;
}

export async function patchMembers(id, { members }, actor) {
  const team = await Team.findByIdAndUpdate(
    id,
    { $set: { members } },
    { new: true },
  ).lean();

  if (!team) throw new NotFoundError('Team not found');

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'team.members_updated',
    resourceType: 'team',
    resourceId: id,
    payload: { memberCount: members.length },
  });

  return team;
}

export default { create, findById, patchMembers };
