import mongoose from 'mongoose';
import { BOUNDARY_LEVELS } from './geo.constants.js';

const boundarySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    level: {
      type: String,
      enum: Object.values(BOUNDARY_LEVELS),
      required: true,
      index: true,
    },
    parentCode: { type: String, default: null, index: true },
    stateCode: { type: String, default: 'JH', index: true },
    geometry: {
      type: { type: String, enum: ['Polygon', 'MultiPolygon'], default: 'Polygon' },
      coordinates: { type: [], required: true },
    },
    centroid: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    publicCentroid: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: null },
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

boundarySchema.index({ geometry: '2dsphere' });
boundarySchema.index({ centroid: '2dsphere' });

export const Boundary = mongoose.model('Boundary', boundarySchema);
export default Boundary;
