import mongoose from 'mongoose';

const axisEntrySchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    label: { type: String, default: null },
    weight: { type: Number, min: 0, max: 1, default: 1 },
    source: { type: String, enum: ['self_declared', 'enriched', 'verified'], default: 'self_declared' },
  },
  { _id: false },
);

const capabilityProfileSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, unique: true, index: true },
    axes: {
      topics: { type: [axisEntrySchema], default: [] },
      methodologies: { type: [axisEntrySchema], default: [] },
      applications: { type: [axisEntrySchema], default: [] },
      facilities: { type: [axisEntrySchema], default: [] },
      capacity: {
        maxConcurrentChallenges: { type: Number, default: 5, min: 0 },
        currentLoad: { type: Number, default: 0, min: 0 },
        notes: { type: String, default: null },
      },
    },
    selfDeclaration: {
      summary: { type: String, default: null },
      strengths: [{ type: String }],
      limitations: [{ type: String }],
      declaredAt: { type: Date, default: null },
      declaredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    enrichment: {
      extractedTopics: [{ type: String }],
      inferredMethodologies: [{ type: String }],
      confidence: { type: Number, min: 0, max: 1, default: null },
      enrichedAt: { type: Date, default: null },
      modelVersion: { type: String, default: null },
    },
    coiFlags: [{ type: String }],
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

capabilityProfileSchema.index({ 'axes.topics.code': 1 });

export const CapabilityProfile = mongoose.model('CapabilityProfile', capabilityProfileSchema);
export default CapabilityProfile;
