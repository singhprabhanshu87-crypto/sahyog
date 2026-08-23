import mongoose from 'mongoose';
import { CLUSTER_STATUS } from './clusters.constants.js';

const clusterSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(CLUSTER_STATUS),
      default: CLUSTER_STATUS.OPEN,
      index: true,
    },
    representativeSubmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      default: null,
    },
    submissionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
    duplicateCount: { type: Number, default: 1 },
    districtCode: { type: String, default: null, index: true },
    triageType: { type: String, enum: ['grievance', 'challenge', 'unknown'], default: null },
    categories: [{
      domainId: { type: String },
      label: { type: String },
      confidence: { type: Number },
    }],
    summary: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

clusterSchema.index({ createdAt: -1 });

export const Cluster = mongoose.model('Cluster', clusterSchema);
export default Cluster;
