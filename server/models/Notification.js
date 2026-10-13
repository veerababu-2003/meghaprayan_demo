const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['weather_alert', 'trip_reminder', 'live_sharing', 'system'],
      default: 'system'
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'danger', 'success'],
      default: 'info'
    },
    read: {
      type: Boolean,
      default: false
    },
    link: String,
    data: Object
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
