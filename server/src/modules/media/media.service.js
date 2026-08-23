import { v2 as cloudinary } from 'cloudinary';
import { nanoid } from 'nanoid';
import config from '../../config/index.js';
import { MediaAsset } from './media.schema.js';
import paginate from '../../common/lib/paginate.js';
import { publish } from '../../common/lib/event-bus.js';
import { NotFoundError, BadRequestError } from '../../common/errors/http-errors.js';
import { MEDIA_STATUS } from '../../config/constants.js';
import logger from '../../common/lib/logger.js';

let cloudinaryConfigured = false;

function ensureCloudinary() {
  if (cloudinaryConfigured) return true;
  if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY) {
    return false;
  }
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
  });
  cloudinaryConfigured = true;
  return true;
}

export async function createRecord(data, uploadedBy) {
  if (!config.mediaAllowedTypes.includes(data.mimeType)) {
    throw new BadRequestError(`MIME type ${data.mimeType} is not allowed`);
  }

  const maxBytes = config.MEDIA_MAX_SIZE_MB * 1024 * 1024;
  if (data.sizeBytes > maxBytes) {
    throw new BadRequestError(`File exceeds maximum size of ${config.MEDIA_MAX_SIZE_MB}MB`);
  }

  const asset = await MediaAsset.create({
    ...data,
    uploadedBy,
    status: MEDIA_STATUS.PENDING,
    storageKey: `sahyog/${data.resourceType}/${data.resourceId}/${nanoid()}`,
  });

  await publish({
    actor: { id: uploadedBy.toString(), type: 'user' },
    action: 'media.created',
    resourceType: 'media',
    resourceId: asset._id.toString(),
    payload: { resourceType: data.resourceType, resourceId: data.resourceId },
  });

  return asset.toObject();
}

export async function findById(id) {
  const asset = await MediaAsset.findById(id).lean();
  if (!asset) throw new NotFoundError('Media asset not found');
  return asset;
}

export async function list({ resourceType, resourceId, page, limit }) {
  const filter = {};
  if (resourceType) filter.resourceType = resourceType;
  if (resourceId) filter.resourceId = resourceId;
  filter.status = { $ne: MEDIA_STATUS.DELETED };
  return paginate(MediaAsset, { filter, page, limit });
}

/**
 * Signed URL stub — returns a Cloudinary signed URL when configured,
 * otherwise a local stub URL for development.
 */
export async function getSignedUrl(id, actor) {
  const asset = await MediaAsset.findById(id);
  if (!asset) throw new NotFoundError('Media asset not found');

  if (asset.status === MEDIA_STATUS.DELETED) {
    throw new NotFoundError('Media asset has been deleted');
  }

  const expiresAt = new Date(Date.now() + config.MEDIA_SIGNED_URL_TTL_SECONDS * 1000);

  if (ensureCloudinary() && asset.publicId) {
    const signedUrl = cloudinary.url(asset.publicId, {
      sign_url: true,
      secure: true,
      resource_type: asset.mimeType.startsWith('video/') ? 'video' : 'image',
    });

    return {
      url: signedUrl,
      expiresAt,
      asset: asset.toObject(),
    };
  }

  // Dev stub when Cloudinary is not configured
  const stubUrl = `${config.API_BASE_URL}/api/media/${id}/stub?token=${nanoid(16)}&expires=${expiresAt.getTime()}`;

  logger.debug({ mediaId: id, actor: actor?.id }, 'Returning stub signed URL (Cloudinary not configured)');

  return {
    url: stubUrl,
    expiresAt,
    asset: asset.toObject(),
    stub: true,
  };
}

export async function markUploaded(id, { publicId, url }) {
  const asset = await MediaAsset.findByIdAndUpdate(
    id,
    {
      $set: {
        status: MEDIA_STATUS.READY,
        publicId,
        url,
      },
    },
    { new: true },
  ).lean();

  if (!asset) throw new NotFoundError('Media asset not found');

  await publish({
    actor: { id: asset.uploadedBy.toString(), type: 'user' },
    action: 'media.uploaded',
    resourceType: 'media',
    resourceId: id,
    payload: { publicId },
  });

  return asset;
}

export default { createRecord, findById, list, getSignedUrl, markUploaded };
