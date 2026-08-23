import mongoose from 'mongoose';
import { LANGUAGE_OPERATIONS } from './language.constants.js';

const translationCacheSchema = new mongoose.Schema(
  {
    operation: { type: String, enum: Object.values(LANGUAGE_OPERATIONS), required: true },
    sourceLocale: { type: String, default: null },
    targetLocale: { type: String, default: null },
    sourceHash: { type: String, required: true, index: true },
    sourceText: { type: String, default: null },
    resultText: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1, default: null },
    needsHumanAssist: { type: Boolean, default: false },
    provider: { type: String, default: 'disabled' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

translationCacheSchema.index({ operation: 1, sourceHash: 1, targetLocale: 1 });

export const TranslationCache = mongoose.model('TranslationCache', translationCacheSchema);
export default TranslationCache;
