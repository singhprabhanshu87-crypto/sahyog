import { Project } from './projects.schema.js';
import { Challenge } from '../challenges/challenges.schema.js';
import { isIndustryBlocked } from '../agreements/agreements.service.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError, BadRequestError } from '../../common/errors/http-errors.js';
import { PROJECT_STATUS } from './projects.constants.js';

export async function create(data, actor) {
  const orgId = data.orgId ?? actor.orgId;
  if (!orgId) throw new BadRequestError('orgId required');

  if (actor.role === 'industry_member' && await isIndustryBlocked(data.challengeId)) {
    throw new BadRequestError('Industry participation blocked until agreement is signed');
  }

  const project = await Project.create({
    ...data,
    orgId,
    status: PROJECT_STATUS.ACTIVE,
    createdBy: actor.id,
  });

  await Challenge.findByIdAndUpdate(data.challengeId, { $set: { projectId: project._id } });

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'project.created',
    resourceType: 'project',
    resourceId: project._id.toString(),
    payload: {
      challengeId: data.challengeId,
      orgId,
      claimId: data.claimId,
    },
  });

  return project.toObject();
}

export async function findById(id) {
  const project = await Project.findById(id).lean();
  if (!project) throw new NotFoundError('Project not found');
  return project;
}

export default { create, findById };
