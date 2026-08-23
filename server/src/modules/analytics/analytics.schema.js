import mongoose from 'mongoose';
import { SNAPSHOT_TYPES } from './analytics.constants.js';

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    type: { type: String, enum: Object.values(SNAPSHOT_TYPES), required: true, index: true },
    districtCode: { type: String, index: true, default: null },
    periodStart: { type: Date, default: null },
    periodEnd: { type: Date, default: null },
    metrics: {
      challengeVolume: { type: Number, default: 0 },
      challengeCoverage: { type: Number, default: 0 },
      activeProjects: { type: Number, default: 0 },
      validatedChallenges: { type: Number, default: 0 },
      orgParticipation: { type: Number, default: 0 },
      districtCount: { type: Number, default: 0 },
      coverageRatio: { type: Number, default: 0 },
      volumeRatio: { type: Number, default: 0 },
    },
    breakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
    computedAt: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

analyticsSnapshotSchema.index({ type: 1, districtCode: 1, computedAt: -1 });

export const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);
export default AnalyticsSnapshot;
