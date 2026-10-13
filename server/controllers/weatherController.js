const { fetchPointWeather } = require('../services/weatherService');

// @desc    Get current weather for coordinates
// @route   GET /api/weather/current?lat=..&lng=..
exports.getCurrentWeather = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const weather = await fetchPointWeather(parseFloat(lat), parseFloat(lng));
    res.status(200).json({
      success: true,
      weather
    });
  } catch (error) {
    next(error);
  }
};
