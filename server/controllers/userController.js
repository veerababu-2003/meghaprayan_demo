const User = require('../models/User');
const Trip = require('../models/Trip');

// @desc    Update user profile & preferences
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, preferredMode, preferences } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (preferredMode) user.preferredMode = preferredMode;
    if (preferences) {
      user.preferences = {
        ...user.preferences.toObject(),
        ...preferences
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredMode: user.preferredMode,
        preferences: user.preferences
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user travel statistics computed from saved trips
// @route   GET /api/users/stats
exports.getUserStats = async (req, res, next) => {
  try {
    const trips = await Trip.find({ user: req.user.id });

    let totalDistanceKm = 0;
    let totalMinutes = 0;
    let completedTrips = 0;
    let plannedTrips = 0;

    trips.forEach(t => {
      const activeRoute = t.routes && t.routes[t.selectedRouteIndex || 0];
      if (activeRoute) {
        totalDistanceKm += activeRoute.distanceKm || 0;
        totalMinutes += activeRoute.durationMinutes || 0;
      }
      if (t.status === 'completed') completedTrips++;
      else if (t.status === 'planned') plannedTrips++;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalTrips: trips.length,
        completedTrips,
        plannedTrips,
        totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
        totalHours: Math.round((totalMinutes / 60) * 10) / 10
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account and all associated trips
// @route   DELETE /api/users/account
exports.deleteAccount = async (req, res, next) => {
  try {
    await Trip.deleteMany({ user: req.user.id });
    await User.findByIdAndDelete(req.user.id);

    res.clearCookie('refreshToken');
    res.status(200).json({
      success: true,
      message: 'Account and associated records deleted permanently'
    });
  } catch (error) {
    next(error);
  }
};
