import mongoose from 'mongoose';
import { VALIDATION_STATUS } from './validation.constants.js';
import { PROBLEM_RESOLUTION_LEVELS } from '../challenges/challenges.constants.js';

const signOffSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    signedAt: { type: Date, default: Date.now },
    comments: { type: String, default: null },
  },
  { _id: false },
);

const validationRecordSchema = new mongoose.Schema(
  {
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, unique: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    status: { type: String, enum: Object.values(VALIDATION_STATUS), default: VALIDATION_STATUS.PENDING, index: true },
    problemResolution: {
      type: String,
      enum: Object.values(PROBLEM_RESOLUTION_LEVELS),
      default: PROBLEM_RESOLUTION_LEVELS.UNRESOLVED,
    },
    signOffs: { type: [signOffSchema], default: [] },
    requiredSignOffCount: { type: Number, default: 2 },
    communityFeedback: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const ValidationRecord = mongoose.model('ValidationRecord', validationRecordSchema);
export default ValidationRecord;
