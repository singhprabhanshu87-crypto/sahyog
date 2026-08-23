import mongoose from 'mongoose';
import { ROLES, MEMBERSHIP_STATUS } from '../../config/constants.js';
import { USER_STATUS } from './users.constants.js';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: null, trim: true },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.CITIZEN },
    passwordHash: { type: String, default: null, select: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    primaryOrgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    districts: [{ type: String }],
    locale: { type: String, default: 'hi' },
    status: { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);

const membershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    role: { type: String, enum: Object.values(ROLES), required: true },
    status: {
      type: String,
      enum: Object.values(MEMBERSHIP_STATUS),
      default: MEMBERSHIP_STATUS.ACTIVE,
    },
    title: { type: String, default: null },
    department: { type: String, default: null },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

membershipSchema.index({ userId: 1, orgId: 1 }, { unique: true });

export const Membership = mongoose.model('Membership', membershipSchema);

export default { User, Membership };
