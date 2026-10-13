const Trip = require('../models/Trip');
const { fetchPointWeather } = require('../services/weatherService');

function setupLiveTripSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join a live trip room
    socket.on('join_trip', async ({ tripId }) => {
      socket.join(`trip_${tripId}`);
      console.log(`[Socket.IO] Client ${socket.id} joined room trip_${tripId}`);
      
      socket.emit('joined_room', {
        tripId,
        status: 'connected',
        timestamp: new Date().toISOString()
      });
    });

    // Leave a live trip room
    socket.on('leave_trip', ({ tripId }) => {
      socket.leave(`trip_${tripId}`);
      console.log(`[Socket.IO] Client ${socket.id} left room trip_${tripId}`);
    });

    // Receive live geolocation updates from traveling user
    socket.on('update_location', async (payload) => {
      const { tripId, lat, lng, speedKmh, heading, distanceRemainingKm, etaMinutes } = payload;
      
      if (!tripId || lat === undefined || lng === undefined) return;

      // Broadcast immediately to anyone viewing or tracking this trip in real time
      io.to(`trip_${tripId}`).emit('location_broadcast', {
        tripId,
        lat,
        lng,
        speedKmh: speedKmh || 0,
        heading: heading || 0,
        distanceRemainingKm,
        etaMinutes,
        timestamp: new Date().toISOString()
      });

      // Optionally fetch real-time atmospheric conditions at the current live location
      try {
        const liveWeather = await fetchPointWeather(lat, lng);
        io.to(`trip_${tripId}`).emit('live_weather_update', {
          tripId,
          weather: liveWeather
        });
      } catch (err) {
        // silent fallback
      }

      // Update trip state in db without blocking socket
      Trip.findById(tripId).then(async (trip) => {
        if (trip && trip.liveTracking && trip.liveTracking.isActive) {
          trip.liveTracking.currentLat = lat;
          trip.liveTracking.currentLng = lng;
          trip.liveTracking.speedKmh = speedKmh || 0;
          trip.liveTracking.heading = heading || 0;
          trip.liveTracking.lastUpdated = new Date();
          await trip.save();
        }
      }).catch(err => console.error('[Socket DB error]', err.message));
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupLiveTripSocket;
