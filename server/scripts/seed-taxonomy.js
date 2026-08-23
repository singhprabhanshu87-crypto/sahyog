/**
 * Seed taxonomy terms for capability matching axes.
 * Usage: node scripts/seed-taxonomy.js
 */
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import logger from '../src/common/lib/logger.js';

const taxonomySchema = new mongoose.Schema(
  {
    axis: { type: String, required: true, index: true },
    code: { type: String, required: true },
    label: { type: String, required: true },
    parentCode: { type: String, default: null },
    locale: { type: String, default: 'en' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

taxonomySchema.index({ axis: 1, code: 1 }, { unique: true });

const TaxonomyTerm = mongoose.models.TaxonomyTerm ?? mongoose.model('TaxonomyTerm', taxonomySchema);

const TAXONOMY_SEED = [
  { axis: 'topics', code: 'water', label: 'Water & Sanitation' },
  { axis: 'topics', code: 'agriculture', label: 'Agriculture & Livelihood' },
  { axis: 'topics', code: 'health', label: 'Health & Nutrition' },
  { axis: 'topics', code: 'education', label: 'Education & Skills' },
  { axis: 'topics', code: 'energy', label: 'Clean Energy' },
  { axis: 'topics', code: 'tribal', label: 'Tribal Heritage & Culture' },
  { axis: 'methodologies', code: 'field_study', label: 'Field Study' },
  { axis: 'methodologies', code: 'lab_research', label: 'Laboratory Research' },
  { axis: 'methodologies', code: 'design_thinking', label: 'Design Thinking' },
  { axis: 'methodologies', code: 'community_engagement', label: 'Community Engagement' },
  { axis: 'applications', code: 'rural_dev', label: 'Rural Development' },
  { axis: 'applications', code: 'urban_planning', label: 'Urban Planning' },
  { axis: 'applications', code: 'msme_support', label: 'MSME Support' },
  { axis: 'facilities', code: 'wet_lab', label: 'Wet Laboratory' },
  { axis: 'facilities', code: 'makerspace', label: 'Makerspace / Fab Lab' },
  { axis: 'facilities', code: 'field_station', label: 'Field Research Station' },
];

async function seed() {
  await connectDatabase();

  for (const term of TAXONOMY_SEED) {
    await TaxonomyTerm.updateOne(
      { axis: term.axis, code: term.code },
      { $set: term },
      { upsert: true },
    );
  }

  const count = await TaxonomyTerm.countDocuments();
  logger.info({ count }, 'Taxonomy seed complete');
  await disconnectDatabase();
}

seed().catch((err) => {
  logger.fatal({ err }, 'Taxonomy seed failed');
  process.exit(1);
});
