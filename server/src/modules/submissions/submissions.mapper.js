export function toPublic(submission) {
  if (!submission) return null;
  return {
    trackingId: submission.trackingId,
    status: submission.status,
    createdAt: submission.createdAt,
    publicLocation: submission.publicLocation
      ? {
          precision: submission.publicLocation.precision,
          boundaryCode: submission.publicLocation.boundaryCode,
        }
      : null,
    triageType: submission.triage?.type || null,
    categories: (submission.categories || []).map((c) => ({
      domainId: c.domainId,
      label: c.label,
    })),
  };
}

export function toAssignee(submission) {
  if (!submission) return null;
  return {
    ...toPublic(submission),
    id: submission._id?.toString?.() ?? submission.id,
    submissionType: submission.submissionType,
    channel: submission.channel,
    text: submission.textNormalized || submission.text,
    locale: submission.locale,
    mediaRefs: (submission.mediaRefs || []).map((m) => m?.toString?.() ?? m),
    location: submission.location
      ? {
          districtCode: submission.location.districtCode,
          blockCode: submission.location.blockCode,
          panchayatCode: submission.location.panchayatCode,
        }
      : null,
    clusterId: submission.clusterId?.toString?.() ?? submission.clusterId,
    triage: submission.triage,
    categories: submission.categories,
    consentGiven: submission.consentGiven,
    updatedAt: submission.updatedAt,
  };
}

export function toInternal(submission) {
  if (!submission) return null;
  return {
    id: submission._id?.toString?.() ?? submission.id,
    trackingId: submission.trackingId,
    status: submission.status,
    submissionType: submission.submissionType,
    channel: submission.channel,
    text: submission.text,
    textNormalized: submission.textNormalized,
    locale: submission.locale,
    voiceMediaId: submission.voiceMediaId?.toString?.() ?? submission.voiceMediaId,
    mediaRefs: (submission.mediaRefs || []).map((m) => m?.toString?.() ?? m),
    location: submission.location,
    publicLocation: submission.publicLocation,
    consentGiven: submission.consentGiven,
    originatorId: submission.originatorId?.toString?.() ?? submission.originatorId,
    facilitatorId: submission.facilitatorId?.toString?.() ?? submission.facilitatorId,
    submittedBy: submission.submittedBy?.toString?.() ?? submission.submittedBy,
    clusterId: submission.clusterId?.toString?.() ?? submission.clusterId,
    triage: submission.triage,
    categories: submission.categories,
    metadata: submission.metadata,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
