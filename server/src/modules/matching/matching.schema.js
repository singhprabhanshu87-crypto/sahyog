import mongoose from 'mongoose';
import { MATCH_RUN_STATUS, MATCH_STAGE } from './matching.constants.js';

const scoreEntrySchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    relevanceScore: { type: Number, min: 0, max: 1, default: 0 },
    capacityScore: { type: Number, min: 0, max: 1, default: 0 },
    fairnessScore: { type: Number, min: 0, max: 1, default: 0 },
    coiBlocked: { type: Boolean, default: false },
    compositeScore: { type: Number, min: 0, max: 1, default: 0 },
    rank: { type: Number, default: null },
    assigned: { type: Boolean, default: false },
  },
  { _id: false },
);

const matchRunSchema = new mongoose.Schema(
  {
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    status: { type: String, enum: Object.values(MATCH_RUN_STATUS), default: MATCH_RUN_STATUS.PENDING, index: true },
    stage: { type: String, enum: Object.values(MATCH_STAGE), default: MATCH_STAGE.RELEVANCE },
    shortlistSize: { type: Number, default: 5 },
    scores: { type: [scoreEntrySchema], default: [] },
    assignedOrgIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    completedAt: { type: Date, default: null },
    error: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

const matchRationaleSchema = new mongoose.Schema(
  {
    matchRunId: { type: mongoose.Schema.Types.ObjectId, ref: 'MatchRun', required: true, index: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    stage: { type: String, enum: Object.values(MATCH_STAGE), required: true },
    rationale: { type: String, required: true },
    factors: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

matchRunSchema.index({ challengeId: 1, createdAt: -1 });

export const MatchRun = mongoose.model('MatchRun', matchRunSchema);
export const MatchRationale = mongoose.model('MatchRationale', matchRationaleSchema);
export default { MatchRun, MatchRationale };
