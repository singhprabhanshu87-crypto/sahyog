import mongoose from 'mongoose';
import { AGREEMENT_STATUS, SIGNER_ROLES } from './agreements.constants.js';

const signatureSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: Object.values(SIGNER_ROLES), required: true },
    signedAt: { type: Date, default: Date.now },
    signatureRef: { type: String, default: null },
  },
  { _id: false },
);

const agreementSchema = new mongoose.Schema(
  {
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    status: { type: String, enum: Object.values(AGREEMENT_STATUS), default: AGREEMENT_STATUS.DRAFT, index: true },
    ipTerms: {
      ownership: { type: String, default: 'shared' },
      commercialUse: { type: Boolean, default: false },
      attributionRequired: { type: Boolean, default: true },
      termsText: { type: String, default: null },
    },
    requiredSigners: [{ type: String, enum: Object.values(SIGNER_ROLES) }],
    signatures: { type: [signatureSchema], default: [] },
    blocksIndustryUntilSigned: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const Agreement = mongoose.model('Agreement', agreementSchema);
export default Agreement;
