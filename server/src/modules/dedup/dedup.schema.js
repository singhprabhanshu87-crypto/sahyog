import mongoose from 'mongoose';
import { DEDUP_DECISIONS } from './dedup.constants.js';

const dedupDecisionSchema = new mongoose.Schema(
  {
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true, index: true },
    matchedSubmissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', default: null },
    matchedClusterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cluster', default: null },
    decision: { type: String, enum: Object.values(DEDUP_DECISIONS), required: true },
    similarity: { type: Number, default: null },
    geoDistanceMeters: { type: Number, default: null },
    timeDeltaDays: { type: Number, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const DedupDecision = mongoose.model('DedupDecision', dedupDecisionSchema);
export default DedupDecision;
