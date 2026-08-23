export function toPublic(agreement) {
  if (!agreement) return null;
  return {
    id: agreement._id?.toString?.() ?? agreement.id,
    challengeId: agreement.challengeId?.toString?.() ?? agreement.challengeId,
    status: agreement.status,
    isFullySigned: agreement.status === 'signed',
  };
}

export function toAssignee(agreement) {
  if (!agreement) return null;
  return {
    ...toPublic(agreement),
    ipTerms: agreement.ipTerms ? {
      ownership: agreement.ipTerms.ownership,
      commercialUse: agreement.ipTerms.commercialUse,
    } : null,
    requiredSigners: agreement.requiredSigners ?? [],
    signatureCount: (agreement.signatures ?? []).length,
    blocksIndustryUntilSigned: agreement.blocksIndustryUntilSigned,
  };
}

export function toInternal(agreement) {
  if (!agreement) return null;
  return {
    id: agreement._id?.toString?.() ?? agreement.id,
    challengeId: agreement.challengeId?.toString?.() ?? agreement.challengeId,
    projectId: agreement.projectId?.toString?.() ?? agreement.projectId,
    teamId: agreement.teamId?.toString?.() ?? agreement.teamId,
    status: agreement.status,
    ipTerms: agreement.ipTerms,
    requiredSigners: agreement.requiredSigners ?? [],
    signatures: agreement.signatures ?? [],
    blocksIndustryUntilSigned: agreement.blocksIndustryUntilSigned,
    createdBy: agreement.createdBy?.toString?.() ?? agreement.createdBy,
    metadata: agreement.metadata,
    createdAt: agreement.createdAt,
    updatedAt: agreement.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
