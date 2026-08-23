import mongoose from 'mongoose';
import { TEAM_ROLES } from './teams.constants.js';

const teamMemberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: Object.values(TEAM_ROLES), required: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const teamSchema = new mongoose.Schema(
  {
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, default: null },
    members: { type: [teamMemberSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

teamSchema.index({ challengeId: 1, orgId: 1 }, { unique: true });

export const Team = mongoose.model('Team', teamSchema);
export default Team;
