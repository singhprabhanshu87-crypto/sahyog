import mongoose from 'mongoose';

const jobAuditSchema = new mongoose.Schema(
  {
    queueName: { type: String, required: true, index: true },
    jobName: { type: String, required: true },
    jobId: { type: String, required: true, index: true },
    resourceType: { type: String, default: null },
    resourceId: { type: String, default: null, index: true },
    status: { type: String, enum: ['queued', 'completed', 'failed'], default: 'queued' },
    attempts: { type: Number, default: 0 },
    result: { type: mongoose.Schema.Types.Mixed, default: null },
    error: { type: String, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const JobAudit = mongoose.model('JobAudit', jobAuditSchema);
export default JobAudit;
