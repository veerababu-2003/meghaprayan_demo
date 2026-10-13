const { fetchOsrmRoutes, sampleCoordinatesAlongRoute } = require('../services/routingService');
const { fetchWeatherAlongCoordinates } = require('../services/weatherService');
const { scoreCandidateRoutes } = require('../utils/routeScoring');
const { generateRecommendations } = require('../services/recommendationService');

// @desc    Calculate routes, weather segments, and multi-factor Dijkstra score
// @route   POST /api/routes/calculate
exports.calculateRoutes = async (req, res, next) => {
  try {
    const { origin, destination, mode = 'car', departureTime } = req.body;

    if (!origin || !origin.lat || !origin.lng || !destination || !destination.lat || !destination.lng) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination with valid lat/lng coordinates are required'
      });
    }

    const depTime = departureTime ? new Date(departureTime) : new Date();

    // 1. Fetch raw routes and alternatives from OSRM
    const candidateRoutes = await fetchOsrmRoutes(origin, destination, mode);

    // 2. Sample weather along each candidate route
    const enrichedRoutes = await Promise.all(
      candidateRoutes.map(async (route) => {
        const sampledPoints = sampleCoordinatesAlongRoute(route.geometry.coordinates, 6);
        const weatherPoints = await fetchWeatherAlongCoordinates(sampledPoints, depTime, route.durationMinutes);

        const recommendations = generateRecommendations({
          distanceKm: route.distanceKm,
          durationMinutes: route.durationMinutes,
          weatherPoints,
          selectedMode: mode
        });

        return {
          ...route,
          weatherPoints,
          vehicleRecommendation: recommendations
        };
      })
    );

    // 3. Multi-factor Dijkstra scoring & transparent weighting
    const scoredRoutes = scoreCandidateRoutes(enrichedRoutes, mode);

    res.status(200).json({
      success: true,
      routes: scoredRoutes,
      meta: {
        origin,
        destination,
        mode,
        departureTime: depTime
      }
    });
  } catch (error) {
    next(error);
  }
};
