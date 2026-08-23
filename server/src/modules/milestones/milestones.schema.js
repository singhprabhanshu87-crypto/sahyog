import mongoose from 'mongoose';
import { MILESTONE_STATUS, GATE_REVIEW_OUTCOME } from './milestones.constants.js';

const gateReviewSchema = new mongoose.Schema(
  {
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    outcome: { type: String, enum: Object.values(GATE_REVIEW_OUTCOME), required: true },
    comments: { type: String, default: null },
    reviewedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const milestoneSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    gateDefinition: {
      criteria: [{ type: String }],
      requiredEvidenceTypes: [{ type: String }],
      trlGate: { type: Number, min: 1, max: 9, default: null },
      srlGate: { type: Number, min: 1, max: 9, default: null },
    },
    status: { type: String, enum: Object.values(MILESTONE_STATUS), default: MILESTONE_STATUS.PENDING, index: true },
    evidenceRefs: [{ type: String }],
    evidenceSubmittedAt: { type: Date, default: null },
    evidenceSubmittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    gateReviews: { type: [gateReviewSchema], default: [] },
    dueDate: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const Milestone = mongoose.model('Milestone', milestoneSchema);
export default Milestone;
