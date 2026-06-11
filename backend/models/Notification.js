const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    titleKey: {
      type: String,
      required: [true, 'Title key is required'],
    },
    messageKey: {
      type: String,
      required: [true, 'Message key is required'],
    },
    type: {
      type: String,
      enum: ['weather_alert', 'system'],
      default: 'weather_alert',
    },
    read: {
      type: Boolean,
      default: false,
    },
    district: {
      type: String,
      default: null,
    },
    dateString: {
      type: String,
      required: [true, 'Date string is required'],
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate alerts for same user, type, and day
notificationSchema.index({ userId: 1, titleKey: 1, dateString: 1 }, { unique: true });

module.exports = mongoose.model('Notification', notificationSchema);
