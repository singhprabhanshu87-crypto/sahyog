import mongoose from 'mongoose';
import { MEDIA_STATUS } from '../../config/constants.js';
import { MEDIA_RESOURCE_TYPES } from './media.constants.js';

const mediaAssetSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(MEDIA_STATUS),
      default: MEDIA_STATUS.PENDING,
      index: true,
    },
    resourceType: {
      type: String,
      enum: Object.values(MEDIA_RESOURCE_TYPES),
      required: true,
      index: true,
    },
    resourceId: { type: String, required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storageProvider: { type: String, default: 'cloudinary' },
    storageKey: { type: String, default: null },
    publicId: { type: String, default: null },
    url: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

mediaAssetSchema.index({ resourceType: 1, resourceId: 1 });

export const MediaAsset = mongoose.model('MediaAsset', mediaAssetSchema);
export default MediaAsset;
