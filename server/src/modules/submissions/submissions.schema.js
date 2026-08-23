import mongoose from 'mongoose';
import { SUBMISSION_STATUS, SUBMISSION_TYPES, SUBMISSION_CHANNELS } from './submissions.constants.js';

const submissionSchema = new mongoose.Schema(
  {
    trackingId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: Object.values(SUBMISSION_STATUS),
      default: SUBMISSION_STATUS.RECEIVED,
      index: true,
    },
    submissionType: {
      type: String,
      enum: Object.values(SUBMISSION_TYPES),
      default: SUBMISSION_TYPES.DIRECT,
    },
    channel: {
      type: String,
      enum: Object.values(SUBMISSION_CHANNELS),
      default: SUBMISSION_CHANNELS.WEB,
    },
    text: { type: String, default: null },
    textNormalized: { type: String, default: null },
    locale: { type: String, default: null },
    voiceMediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'MediaAsset', default: null },
    mediaRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MediaAsset' }],
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      districtCode: { type: String, default: null, index: true },
      blockCode: { type: String, default: null },
      panchayatCode: { type: String, default: null, index: true },
    },
    publicLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      precision: { type: String, default: null },
      boundaryCode: { type: String, default: null },
    },
    consentGiven: { type: Boolean, required: true, default: false },
    originatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    facilitatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    clusterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cluster', default: null, index: true },
    embedding: { type: [Number], default: null, select: false },
    embeddingModelVersion: { type: String, default: null },
    triage: {
      type: { type: String, enum: ['grievance', 'challenge', 'unknown'], default: null },
      confidence: { type: Number, default: null },
      needsReview: { type: Boolean, default: false },
    },
    categories: [{
      domainId: { type: String },
      label: { type: String },
      confidence: { type: Number },
    }],
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ 'location.districtCode': 1, createdAt: -1 });

export const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
