export function toPublic(taxonomy) {
  if (!taxonomy) return null;
  return {
    version: taxonomy.version,
    domains: taxonomy.domains,
    trlBands: taxonomy.trlBands,
    srlBands: taxonomy.srlBands,
    closureReasonCodes: taxonomy.closureReasonCodes,
    publishedAt: taxonomy.publishedAt,
  };
}

export function toDomainList(taxonomy) {
  if (!taxonomy) return [];
  return (taxonomy.domains || []).map((d) => ({
    id: d.id,
    label: d.label,
    description: d.description,
  }));
}

export function toInternal(taxonomy) {
  if (!taxonomy) return null;
  return {
    id: taxonomy._id?.toString?.() ?? taxonomy.id,
    ...toPublic(taxonomy),
    isActive: taxonomy.isActive,
    createdAt: taxonomy.createdAt,
    updatedAt: taxonomy.updatedAt,
  };
}

export default { toPublic, toDomainList, toInternal };
