import mongoose from 'mongoose';
import { CLAIM_STATUS } from './claims.constants.js';

const claimSchema = new mongoose.Schema(
  {
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(CLAIM_STATUS), default: CLAIM_STATUS.ACTIVE, index: true },
    exclusivityLock: { type: Boolean, default: true },
    coiChecked: { type: Boolean, default: false },
    coiFlags: [{ type: String }],
    claimWindowEndsAt: { type: Date, required: true },
    releasedAt: { type: Date, default: null },
    releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    releaseReason: { type: String, default: null },
    lastActivityAt: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

claimSchema.index({ challengeId: 1, orgId: 1 }, { unique: true });
claimSchema.index({ status: 1, claimWindowEndsAt: 1 });

export const Claim = mongoose.model('Claim', claimSchema);
export default Claim;
