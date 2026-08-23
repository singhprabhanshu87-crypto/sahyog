import mongoose from 'mongoose';
import { DISPUTE_STATUS } from './disputes.constants.js';

const escalationLogSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    event: { type: String, required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rationale: { type: String, default: null },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const disputeSchema = new mongoose.Schema(
  {
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    filedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: Object.values(DISPUTE_STATUS), default: DISPUTE_STATUS.FILED, index: true },
    escalationLog: { type: [escalationLogSchema], default: [] },
    resolution: { type: String, default: null },
    resolvedAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const Dispute = mongoose.model('Dispute', disputeSchema);
export default Dispute;
