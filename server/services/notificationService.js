const Notification = require('../models/Notification');

async function createNotification({ userId, title, message, type = 'system', severity = 'info', link, data }) {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      severity,
      link,
      data
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error.message);
    return null;
  }
}

async function checkTripWeatherAlerts(trip) {
  if (!trip || !trip.routes || trip.routes.length === 0) return;
  const activeRoute = trip.routes[trip.selectedRouteIndex || 0];
  if (!activeRoute || !activeRoute.weatherPoints) return;

  const rainyPoints = activeRoute.weatherPoints.filter(wp => wp.precipitationProbability >= 60 || wp.precipitation >= 2.0);
  if (rainyPoints.length > 0) {
    await createNotification({
      userId: trip.user,
      title: `Weather Alert for "${trip.title}"`,
      message: `Rain detected along ${rainyPoints.length} point(s) on your route. Drive cautiously!`,
      type: 'weather_alert',
      severity: 'warning',
      link: `/trip/${trip._id}`,
      data: { tripId: trip._id }
    });
  }
}

module.exports = {
  createNotification,
  checkTripWeatherAlerts
};
