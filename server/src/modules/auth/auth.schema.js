import mongoose from 'mongoose';
import { OTP_PURPOSES, SESSION_STATUS } from './auth.constants.js';

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    code: { type: String, required: true },
    purpose: { type: String, enum: Object.values(OTP_PURPOSES), default: OTP_PURPOSES.LOGIN },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: true },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

otpSchema.index({ email: 1, purpose: 1, consumedAt: 1 });

export const Otp = mongoose.model('Otp', otpSchema);

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    status: { type: String, enum: Object.values(SESSION_STATUS), default: SESSION_STATUS.ACTIVE },
    userAgent: { type: String, default: null },
    ip: { type: String, default: null },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Session = mongoose.model('Session', sessionSchema);

export default { Otp, Session };
