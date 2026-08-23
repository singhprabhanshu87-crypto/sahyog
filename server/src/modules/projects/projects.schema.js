import mongoose from 'mongoose';
import { PROJECT_STATUS, BOARD_ITEM_TYPES } from './projects.constants.js';

const boardItemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: Object.values(BOARD_ITEM_TYPES), default: BOARD_ITEM_TYPES.TASK },
    title: { type: String, required: true },
    status: { type: String, default: 'open' },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const projectSchema = new mongoose.Schema(
  {
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    status: { type: String, enum: Object.values(PROJECT_STATUS), default: PROJECT_STATUS.PLANNING, index: true },
    trlTarget: { type: Number, min: 1, max: 9, default: 3 },
    srlTarget: { type: Number, min: 1, max: 9, default: 3 },
    trlCurrent: { type: Number, min: 1, max: 9, default: 1 },
    srlCurrent: { type: Number, min: 1, max: 9, default: 1 },
    boardItems: { type: [boardItemSchema], default: [] },
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const Project = mongoose.model('Project', projectSchema);
export default Project;
