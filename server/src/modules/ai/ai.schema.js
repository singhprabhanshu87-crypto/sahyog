import mongoose from 'mongoose';
import { AI_OPERATIONS } from './ai.constants.js';

const aiCallSchema = new mongoose.Schema(
  {
    operation: { type: String, enum: Object.values(AI_OPERATIONS), required: true, index: true },
    model: { type: String, default: null },
    provider: { type: String, default: 'disabled' },
    resourceType: { type: String, default: null, index: true },
    resourceId: { type: String, default: null, index: true },
    prompt: { type: String, default: null },
    response: { type: mongoose.Schema.Types.Mixed, default: null },
    latencyMs: { type: Number, default: null },
    success: { type: Boolean, default: true },
    error: { type: String, default: null },
    tokenUsage: {
      prompt: { type: Number, default: null },
      completion: { type: Number, default: null },
      total: { type: Number, default: null },
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const AiCall = mongoose.model('AiCall', aiCallSchema);
export default AiCall;
