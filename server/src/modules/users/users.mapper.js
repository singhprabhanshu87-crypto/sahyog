export function toPublic(user) {
  if (!user) return null;
  return {
    id: user._id?.toString?.() ?? user.id,
    name: user.name,
    role: user.role,
  };
}

export function toAssignee(user) {
  if (!user) return null;
  return {
    id: user._id?.toString?.() ?? user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    locale: user.locale,
    primaryOrgId: user.primaryOrgId?.toString?.() ?? user.primaryOrgId ?? null,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}

export function toInternal(user) {
  if (!user) return null;
  return {
    id: user._id?.toString?.() ?? user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    primaryOrgId: user.primaryOrgId?.toString?.() ?? user.primaryOrgId ?? null,
    districts: user.districts ?? [],
    locale: user.locale,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    status: user.status,
    metadata: user.metadata,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toPublicMembership(membership) {
  if (!membership) return null;
  return {
    id: membership._id?.toString?.() ?? membership.id,
    orgId: membership.orgId?.toString?.() ?? membership.orgId,
    role: membership.role,
    status: membership.status,
  };
}

export default { toPublic, toAssignee, toInternal, toPublicMembership };
