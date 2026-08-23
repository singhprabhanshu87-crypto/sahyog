import mongoose from 'mongoose';
import { TAXONOMY_VERSION } from './taxonomy.constants.js';

const taxonomySchema = new mongoose.Schema(
  {
    version: { type: String, required: true, unique: true, default: TAXONOMY_VERSION },
    domains: { type: mongoose.Schema.Types.Mixed, required: true },
    trlBands: { type: mongoose.Schema.Types.Mixed, required: true },
    srlBands: { type: mongoose.Schema.Types.Mixed, required: true },
    closureReasonCodes: { type: mongoose.Schema.Types.Mixed, required: true },
    isActive: { type: Boolean, default: true, index: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Taxonomy = mongoose.model('Taxonomy', taxonomySchema);
export default Taxonomy;
