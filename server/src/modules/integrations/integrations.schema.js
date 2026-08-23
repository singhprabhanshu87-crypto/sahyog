import mongoose from 'mongoose';
import { INTEGRATION_PROVIDERS, INTEGRATION_STATUS } from './integrations.constants.js';

const integrationLogSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: Object.values(INTEGRATION_PROVIDERS), required: true, index: true },
    status: { type: String, enum: Object.values(INTEGRATION_STATUS), default: INTEGRATION_STATUS.PENDING, index: true },
    action: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    response: { type: mongoose.Schema.Types.Mixed, default: null },
    error: { type: String, default: null },
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    correlationId: { type: String, default: null },
  },
  { timestamps: true },
);

export const IntegrationLog = mongoose.model('IntegrationLog', integrationLogSchema);
export default IntegrationLog;
