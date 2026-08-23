import mongoose from 'mongoose';
import { NOTIFICATION_CHANNELS, NOTIFICATION_STATUS } from './notifications.constants.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channel: { type: String, enum: Object.values(NOTIFICATION_CHANNELS), default: NOTIFICATION_CHANNELS.IN_APP },
    status: { type: String, enum: Object.values(NOTIFICATION_STATUS), default: NOTIFICATION_STATUS.PENDING, index: true },
    title: { type: String, required: true },
    body: { type: String, default: null },
    eventAction: { type: String, index: true },
    resourceType: { type: String, default: null },
    resourceId: { type: String, default: null },
    readAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

const notificationPrefsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    channels: {
      in_app: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    subscribedEvents: [{ type: String }],
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' },
      end: { type: String, default: '07:00' },
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const Notification = mongoose.model('Notification', notificationSchema);
export const NotificationPrefs = mongoose.model('NotificationPrefs', notificationPrefsSchema);
export default { Notification, NotificationPrefs };
