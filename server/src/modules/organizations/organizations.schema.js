import mongoose from 'mongoose';
import { ORG_TYPES, ORG_VERIFICATION_STATES } from '../../config/constants.js';
import slugify from '../../common/utils/slugify.js';

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: { type: String, enum: Object.values(ORG_TYPES), required: true },
    description: { type: String, default: null },
    verificationStatus: {
      type: String,
      enum: Object.values(ORG_VERIFICATION_STATES),
      default: ORG_VERIFICATION_STATES.DRAFT,
      index: true,
    },
    districtCodes: [{ type: String, index: true }],
    address: {
      line1: { type: String, default: null },
      district: { type: String, default: null },
      state: { type: String, default: 'Jharkhand' },
      pincode: { type: String, default: null },
    },
    contact: {
      email: { type: String, default: null, lowercase: true },
      phone: { type: String, default: null },
      website: { type: String, default: null },
    },
    registrationNumber: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    verifiedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

organizationSchema.pre('validate', function generateSlug(next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  next();
});

export const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
