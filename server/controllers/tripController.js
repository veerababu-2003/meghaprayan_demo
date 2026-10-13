const Trip = require('../models/Trip');
const { checkTripWeatherAlerts } = require('../services/notificationService');

// @desc    Get all trips for logged-in user
// @route   GET /api/trips
exports.getTrips = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user.id };
    if (status) query.status = status;

    const trips = await Trip.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Trip.countDocuments(query);

    res.status(200).json({
      success: true,
      count: trips.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      trips
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trip by ID
// @route   GET /api/trips/:id
exports.getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    res.status(200).json({
      success: true,
      trip
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save new trip
// @route   POST /api/trips
exports.createTrip = async (req, res, next) => {
  try {
    const tripData = {
      ...req.body,
      user: req.user.id
    };

    const trip = await Trip.create(tripData);

    // Check weather alerts for notifications asynchronously
    checkTripWeatherAlerts(trip).catch(err => console.error('[TripController Alert Check]', err.message));

    res.status(201).json({
      success: true,
      trip
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
exports.updateTrip = async (req, res, next) => {
  try {
    let trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      trip
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
exports.deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    await trip.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Trip removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start live trip tracking
// @route   POST /api/trips/:id/start
exports.startTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    trip.status = 'in_progress';
    trip.liveTracking.isActive = true;
    trip.liveTracking.sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Trip started successfully',
      sessionCode: trip.liveTracking.sessionCode,
      trip
    });
  } catch (error) {
    next(error);
  }
};

// @desc    End live trip tracking
// @route   POST /api/trips/:id/end
exports.endTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    trip.status = 'completed';
    trip.liveTracking.isActive = false;
    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Trip completed successfully',
      trip
    });
  } catch (error) {
    next(error);
  }
};
