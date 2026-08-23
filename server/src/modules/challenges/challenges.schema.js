import mongoose from 'mongoose';
import { CHALLENGE_WORKFLOW_STATES } from '../../config/constants.js';
import { PROBLEM_RESOLUTION_LEVELS, SOLUTION_MATURITY_LEVELS } from './challenges.constants.js';

const scopedBriefSchema = new mongoose.Schema(
  {
    title: { type: String, default: null },
    summary: { type: String, default: null },
    objectives: [{ type: String }],
    constraints: [{ type: String }],
    successCriteria: [{ type: String }],
    taxonomyCodes: [{ type: String }],
    scopedAt: { type: Date, default: null },
    scopedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { _id: false },
);

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    districtCode: { type: String, index: true },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      precision: { type: String, default: 'district' },
    },
    workflowState: {
      type: String,
      enum: Object.values(CHALLENGE_WORKFLOW_STATES),
      default: CHALLENGE_WORKFLOW_STATES.SUBMITTED,
      index: true,
    },
    problemResolution: {
      type: String,
      enum: Object.values(PROBLEM_RESOLUTION_LEVELS),
      default: PROBLEM_RESOLUTION_LEVELS.UNRESOLVED,
    },
    solutionMaturity: {
      type: String,
      enum: Object.values(SOLUTION_MATURITY_LEVELS),
      default: SOLUTION_MATURITY_LEVELS.IDEA,
    },
    scopedBrief: { type: scopedBriefSchema, default: () => ({}) },
    claimedOrgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

challengeSchema.index({ createdAt: -1 });

export const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;
