import mongoose from 'mongoose';
import { REVIEW_QUEUE_STATUS, REVIEW_REASONS } from './classification.constants.js';

const reviewQueueSchema = new mongoose.Schema(
  {
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true, index: true },
    reason: { type: String, enum: Object.values(REVIEW_REASONS), required: true },
    status: {
      type: String,
      enum: Object.values(REVIEW_QUEUE_STATUS),
      default: REVIEW_QUEUE_STATUS.PENDING,
      index: true,
    },
    triageResult: { type: mongoose.Schema.Types.Mixed, default: null },
    categoryResult: { type: mongoose.Schema.Types.Mixed, default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },
    override: {
      triage: { type: mongoose.Schema.Types.Mixed, default: null },
      categories: { type: mongoose.Schema.Types.Mixed, default: null },
      rationale: { type: String, default: null },
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const ReviewQueue = mongoose.model('ReviewQueue', reviewQueueSchema);
export default ReviewQueue;
