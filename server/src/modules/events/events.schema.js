import mongoose from 'mongoose';

const actorSchema = new mongoose.Schema(
  {
    id: { type: String, default: null },
    type: { type: String, enum: ['user', 'system', 'job'], default: 'user' },
    email: { type: String, default: null },
    role: { type: String, default: null },
  },
  { _id: false },
);

const eventSchema = new mongoose.Schema(
  {
    actor: { type: actorSchema, required: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: String, required: true, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    rationale: { type: String, default: null },
    correlationId: { type: String, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

eventSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
eventSchema.index({ 'actor.id': 1, timestamp: -1 });

export const Event = mongoose.model('Event', eventSchema);
export default Event;
