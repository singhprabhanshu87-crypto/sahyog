export function toPublicBoundary(boundary) {
  if (!boundary) return null;
  return {
    code: boundary.code,
    name: boundary.name,
    level: boundary.level,
    parentCode: boundary.parentCode,
  };
}

export function toResolvedLocation(resolution) {
  if (!resolution) return null;
  return {
    district: resolution.district ? toPublicBoundary(resolution.district) : null,
    block: resolution.block ? toPublicBoundary(resolution.block) : null,
    panchayat: resolution.panchayat ? toPublicBoundary(resolution.panchayat) : null,
    publicLocation: resolution.publicLocation,
  };
}

export function toInternal(boundary) {
  if (!boundary) return null;
  return {
    id: boundary._id?.toString?.() ?? boundary.id,
    code: boundary.code,
    name: boundary.name,
    level: boundary.level,
    parentCode: boundary.parentCode,
    stateCode: boundary.stateCode,
    centroid: boundary.centroid,
    publicCentroid: boundary.publicCentroid,
    metadata: boundary.metadata,
    createdAt: boundary.createdAt,
    updatedAt: boundary.updatedAt,
  };
}

export default { toPublicBoundary, toResolvedLocation, toInternal };
