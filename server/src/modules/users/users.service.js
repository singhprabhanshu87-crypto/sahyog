import { User, Membership } from './users.schema.js';
import paginate from '../../common/lib/paginate.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError, ConflictError } from '../../common/errors/http-errors.js';
import { MEMBERSHIP_STATUS } from '../../config/constants.js';

export async function create(data) {
  const user = await User.create(data);

  await publish({
    actor: { id: user._id.toString(), type: 'system' },
    action: 'user.created',
    resourceType: 'user',
    resourceId: user._id.toString(),
    payload: { email: user.email, role: user.role },
  });

  return user.toObject();
}

export async function findById(id) {
  const user = await User.findById(id).lean();
  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function findByEmail(email) {
  return User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash').lean();
}

export async function update(id, data) {
  const user = await User.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
  if (!user) throw new NotFoundError('User not found');

  await publish({
    actor: { id: id.toString(), type: 'user' },
    action: 'user.updated',
    resourceType: 'user',
    resourceId: id.toString(),
    payload: { fields: Object.keys(data) },
  });

  return user;
}

export async function list({ role, page, limit }) {
  const filter = {};
  if (role) filter.role = role;
  return paginate(User, { filter, page, limit });
}

export async function createMembership({ userId, orgId, role, title, department, invitedBy }) {
  const existing = await Membership.findOne({ userId, orgId });
  if (existing) {
    throw new ConflictError('Membership already exists for this user and organization');
  }

  const membership = await Membership.create({
    userId,
    orgId,
    role,
    title,
    department,
    invitedBy,
    status: MEMBERSHIP_STATUS.ACTIVE,
  });

  await publish({
    actor: invitedBy ? { id: invitedBy.toString(), type: 'user' } : { id: null, type: 'system' },
    action: 'membership.created',
    resourceType: 'membership',
    resourceId: membership._id.toString(),
    payload: { userId: userId.toString(), orgId: orgId.toString(), role },
  });

  return membership.toObject();
}

export async function getMembershipsByUser(userId) {
  return Membership.find({ userId, status: MEMBERSHIP_STATUS.ACTIVE }).lean();
}

export async function getMembershipsByOrg(orgId) {
  return Membership.find({ orgId, status: MEMBERSHIP_STATUS.ACTIVE }).lean();
}

export default {
  create,
  findById,
  findByEmail,
  update,
  list,
  createMembership,
  getMembershipsByUser,
  getMembershipsByOrg,
};
