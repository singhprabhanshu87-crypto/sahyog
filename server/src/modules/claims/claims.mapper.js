export function toPublic(claim) {
  if (!claim) return null;
  return {
    id: claim._id?.toString?.() ?? claim.id,
    challengeId: claim.challengeId?.toString?.() ?? claim.challengeId,
    orgId: claim.orgId?.toString?.() ?? claim.orgId,
    status: claim.status,
  };
}

export function toAssignee(claim) {
  if (!claim) return null;
  return {
    ...toPublic(claim),
    claimWindowEndsAt: claim.claimWindowEndsAt,
    exclusivityLock: claim.exclusivityLock,
    lastActivityAt: claim.lastActivityAt,
    createdAt: claim.createdAt,
  };
}

export function toInternal(claim) {
  if (!claim) return null;
  return {
    id: claim._id?.toString?.() ?? claim.id,
    challengeId: claim.challengeId?.toString?.() ?? claim.challengeId,
    orgId: claim.orgId?.toString?.() ?? claim.orgId,
    claimedBy: claim.claimedBy?.toString?.() ?? claim.claimedBy,
    status: claim.status,
    exclusivityLock: claim.exclusivityLock,
    coiChecked: claim.coiChecked,
    coiFlags: claim.coiFlags ?? [],
    claimWindowEndsAt: claim.claimWindowEndsAt,
    releasedAt: claim.releasedAt,
    releasedBy: claim.releasedBy?.toString?.() ?? claim.releasedBy,
    releaseReason: claim.releaseReason,
    lastActivityAt: claim.lastActivityAt,
    metadata: claim.metadata,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
