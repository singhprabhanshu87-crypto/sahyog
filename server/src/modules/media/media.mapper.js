export function toPublic(asset) {
  if (!asset) return null;
  return {
    id: asset._id?.toString?.() ?? asset.id,
    mimeType: asset.mimeType,
    status: asset.status,
    resourceType: asset.resourceType,
    resourceId: asset.resourceId,
    createdAt: asset.createdAt,
  };
}

export function toAssignee(asset) {
  if (!asset) return null;
  return {
    ...toPublic(asset),
    filename: asset.filename,
    originalName: asset.originalName,
    sizeBytes: asset.sizeBytes,
    url: asset.url,
  };
}

export function toInternal(asset) {
  if (!asset) return null;
  return {
    id: asset._id?.toString?.() ?? asset.id,
    filename: asset.filename,
    originalName: asset.originalName,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    status: asset.status,
    resourceType: asset.resourceType,
    resourceId: asset.resourceId,
    uploadedBy: asset.uploadedBy?.toString?.() ?? asset.uploadedBy,
    storageProvider: asset.storageProvider,
    storageKey: asset.storageKey,
    publicId: asset.publicId,
    url: asset.url,
    metadata: asset.metadata,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };
}

export default { toPublic, toAssignee, toInternal };
