import mongoose from 'mongoose';
import { CHALLENGE_WORKFLOW_STATES } from '../../config/constants.js';

const transitionLogSchema = new mongoose.Schema(
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

const workflowInstanceSchema = new mongoose.Schema(
  {
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, unique: true, index: true },
    currentState: {
      type: String,
      enum: Object.values(CHALLENGE_WORKFLOW_STATES),
      default: CHALLENGE_WORKFLOW_STATES.SUBMITTED,
      index: true,
    },
    ownerRole: { type: String, default: 'district_officer' },
    slaDeadline: { type: Date, default: null },
    visibility: { type: String, default: 'internal' },
    transitionLog: { type: [transitionLogSchema], default: [] },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const WorkflowInstance = mongoose.model('WorkflowInstance', workflowInstanceSchema);
export default WorkflowInstance;
