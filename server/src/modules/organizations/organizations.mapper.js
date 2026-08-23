export function toPublic(org) {
  if (!org) return null;
  return {
    id: org._id?.toString?.() ?? org.id,
    name: org.name,
    slug: org.slug,
    type: org.type,
    verificationStatus: org.verificationStatus,
    districtCodes: org.districtCodes ?? [],
  };
}

export function toAssignee(org) {
  if (!org) return null;
  return {
    ...toPublic(org),
    description: org.description,
    address: org.address
      ? { district: org.address.district, state: org.address.state }
      : null,
    contact: org.contact ? { website: org.contact.website } : null,
    createdAt: org.createdAt,
  };
}

export function toInternal(org) {
  if (!org) return null;
  return {
    id: org._id?.toString?.() ?? org.id,
    name: org.name,
    slug: org.slug,
    type: org.type,
    description: org.description,
    verificationStatus: org.verificationStatus,
    districtCodes: org.districtCodes ?? [],
    address: org.address,
    contact: org.contact,
    registrationNumber: org.registrationNumber,
    createdBy: org.createdBy?.toString?.() ?? org.createdBy,
    verifiedBy: org.verifiedBy?.toString?.() ?? org.verifiedBy,
    verifiedAt: org.verifiedAt,
    rejectionReason: org.rejectionReason,
    metadata: org.metadata,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
