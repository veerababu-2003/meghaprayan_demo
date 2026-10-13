const mongoose = require('mongoose');

const weatherPointSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  name: String,
  distanceFromStartKm: Number,
  estimatedTimeArrival: Date,
  temperature: Number,
  weatherCode: Number,
  conditionText: String,
  precipitationProbability: Number,
  precipitation: Number,
  windSpeed: Number,
  relativeHumidity: Number,
  riskLevel: {
    type: String,
    enum: ['low', 'moderate', 'high', 'severe'],
    default: 'low'
  },
  riskReason: String
}, { _id: false });

const routeSchema = new mongoose.Schema({
  routeIndex: Number,
  title: String,
  summary: String,
  distanceKm: Number,
  durationMinutes: Number,
  geometry: {
    type: {
      type: String,
      default: 'LineString'
    },
    coordinates: [[Number]] // [lng, lat] GeoJSON coordinates
  },
  weatherPoints: [weatherPointSchema],
  dijkstraScore: Number, // Computed composite score
  dijkstraExplanation: String,
  isRecommended: {
    type: Boolean,
    default: false
  },
  isFastest: {
    type: Boolean,
    default: false
  },
  isSafest: {
    type: Boolean,
    default: false
  },
  vehicleRecommendation: {
    recommendedVehicle: String,
    advice: String,
    cautionFlags: [String]
  }
}, { _id: false });

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      trim: true,
      default: 'Trip'
    },
    origin: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    destination: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    mode: {
      type: String,
      enum: ['car', 'bike', 'walking'],
      default: 'car'
    },
    departureTime: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed', 'cancelled'],
      default: 'planned'
    },
    routes: [routeSchema],
    selectedRouteIndex: {
      type: Number,
      default: 0
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    liveTracking: {
      isActive: { type: Boolean, default: false },
      currentLat: Number,
      currentLng: Number,
      heading: Number,
      speedKmh: Number,
      lastUpdated: Date,
      sessionCode: String
    }
  },
  {
    timestamps: true
  }
);

tripSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Trip', tripSchema);
