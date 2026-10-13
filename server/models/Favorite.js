const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['destination', 'route', 'trip'],
      default: 'destination'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    data: {
      lat: Number,
      lng: Number,
      name: String,
      origin: Object,
      destination: Object,
      distanceKm: Number,
      durationMinutes: Number,
      tripId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip'
      }
    }
  },
  {
    timestamps: true
  }
);

favoriteSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Favorite', favoriteSchema);
