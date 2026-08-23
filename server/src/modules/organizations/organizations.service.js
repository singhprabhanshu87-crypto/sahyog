import { Organization } from './organizations.schema.js';
import paginate from '../../common/lib/paginate.js';
import { createStateMachine } from '../../common/lib/state-machine.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError, BadRequestError } from '../../common/errors/http-errors.js';
import { ORG_VERIFICATION_STATES } from '../../config/constants.js';
import { VERIFICATION_TRANSITIONS } from './organizations.constants.js';
import slugify from '../../common/utils/slugify.js';

const verificationFsm = createStateMachine({
  states: Object.values(ORG_VERIFICATION_STATES),
  transitions: [
    { from: ORG_VERIFICATION_STATES.DRAFT, event: 'submit', to: ORG_VERIFICATION_STATES.SUBMITTED },
    { from: ORG_VERIFICATION_STATES.SUBMITTED, event: 'verify', to: ORG_VERIFICATION_STATES.VERIFIED },
    { from: ORG_VERIFICATION_STATES.SUBMITTED, event: 'reject', to: ORG_VERIFICATION_STATES.REJECTED },
    { from: ORG_VERIFICATION_STATES.VERIFIED, event: 'activate', to: ORG_VERIFICATION_STATES.ACTIVE },
    { from: ORG_VERIFICATION_STATES.ACTIVE, event: 'suspend', to: ORG_VERIFICATION_STATES.SUSPENDED },
    { from: ORG_VERIFICATION_STATES.SUSPENDED, event: 'activate', to: ORG_VERIFICATION_STATES.ACTIVE },
    { from: ORG_VERIFICATION_STATES.REJECTED, event: 'submit', to: ORG_VERIFICATION_STATES.SUBMITTED },
  ],
});

export async function create(data, createdBy) {
  const slug = await ensureUniqueSlug(slugify(data.name));

  const org = await Organization.create({
    ...data,
    slug,
    createdBy,
    verificationStatus: ORG_VERIFICATION_STATES.SUBMITTED,
  });

  await publish({
    actor: { id: createdBy.toString(), type: 'user' },
    action: 'org.created',
    resourceType: 'organization',
    resourceId: org._id.toString(),
    payload: { name: org.name, type: org.type },
  });

  return org.toObject();
}

export async function findById(id) {
  const org = await Organization.findById(id).lean();
  if (!org) throw new NotFoundError('Organization not found');
  return org;
}

export async function update(id, data, actor) {
  const org = await Organization.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
  if (!org) throw new NotFoundError('Organization not found');

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: 'org.updated',
    resourceType: 'organization',
    resourceId: id,
    payload: { fields: Object.keys(data) },
  });

  return org;
}

export async function list({ type, verificationStatus, districtCode, page, limit }) {
  const filter = {};
  if (type) filter.type = type;
  if (verificationStatus) filter.verificationStatus = verificationStatus;
  if (districtCode) filter.districtCodes = districtCode;
  return paginate(Organization, { filter, page, limit });
}

export async function transitionVerification(id, action, actor, { reason } = {}) {
  const org = await Organization.findById(id);
  if (!org) throw new NotFoundError('Organization not found');

  const result = await verificationFsm.transition({
    currentState: org.verificationStatus,
    event: action,
    actor,
    resource: org.toObject(),
  });

  if (!result.allowed) {
    throw new BadRequestError(result.reason);
  }

  org.verificationStatus = result.to;

  if (action === 'verify') {
    org.verifiedBy = actor.id;
    org.verifiedAt = new Date();
    org.rejectionReason = null;
  }

  if (action === 'reject') {
    org.rejectionReason = reason ?? 'Rejected by PMU';
    org.verifiedBy = actor.id;
    org.verifiedAt = new Date();
  }

  if (action === 'activate') {
    org.verifiedAt = org.verifiedAt ?? new Date();
  }

  await org.save();

  const eventAction = action === 'verify' ? 'org.verified' : `org.${action}ed`;

  await publish({
    actor: { id: actor.id, type: 'user', role: actor.role },
    action: eventAction,
    resourceType: 'organization',
    resourceId: id,
    payload: { from: result.from, to: result.to, reason },
    rationale: reason,
  });

  return org.toObject();
}

async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  while (await Organization.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
}

export default { create, findById, update, list, transitionVerification };
