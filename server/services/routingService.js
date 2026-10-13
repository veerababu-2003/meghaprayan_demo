const axios = require('axios');
const cache = require('./cacheService');

/**
 * Fetch driving/biking/walking routes using Open Source Routing Machine (OSRM)
 * Generates primary path + alternative routes where available
 */
async function fetchOsrmRoutes(origin, destination, mode = 'car') {
  const profileMap = {
    car: 'driving',
    bike: 'bike',
    walking: 'foot'
  };
  const profile = profileMap[mode] || 'driving';

  const cacheKey = `route_${origin.lat.toFixed(4)}_${origin.lng.toFixed(4)}_${destination.lat.toFixed(4)}_${destination.lng.toFixed(4)}_${profile}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`;

  try {
    const response = await axios.get(url, { timeout: 10000 });
    if (!response.data || !response.data.routes || response.data.routes.length === 0) {
      throw new Error('No route found between coordinates');
    }

    const routes = response.data.routes.map((r, idx) => {
      const distanceKm = Math.round((r.distance / 1000) * 10) / 10;
      const durationMinutes = Math.round(r.duration / 60);

      // Extract coordinates array [[lng, lat], ...]
      const coords = r.geometry ? r.geometry.coordinates : [];

      return {
        routeIndex: idx,
        title: idx === 0 ? 'Primary Route' : `Alternative Route ${idx}`,
        summary: r.legs && r.legs[0] && r.legs[0].summary ? r.legs[0].summary : `Via Route ${idx + 1}`,
        distanceKm,
        durationMinutes,
        geometry: {
          type: 'LineString',
          coordinates: coords
        }
      };
    });

    cache.set(cacheKey, routes, 1800); // 30 mins cache
    return routes;
  } catch (error) {
    console.warn(`[RoutingService] OSRM query failed (${error.message}). Generating direct trajectory fallback.`);
    // Safe geodesic interpolated fallback for testing/network drop
    const fallbackCoords = interpolateCoordinates([origin.lng, origin.lat], [destination.lng, destination.lat], 10);
    const estDistance = calculateDirectDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng) * 1.25;
    const speed = mode === 'bike' ? 18 : mode === 'walking' ? 4.5 : 55;
    const estMinutes = Math.round((estDistance / speed) * 60);

    return [
      {
        routeIndex: 0,
        title: 'Direct Route (Estimated)',
        summary: 'Direct overland travel',
        distanceKm: Math.round(estDistance * 10) / 10,
        durationMinutes: estMinutes,
        geometry: {
          type: 'LineString',
          coordinates: fallbackCoords
        }
      }
    ];
  }
}

/**
 * Sample n equidistant coordinates along an array of GeoJSON coordinates
 */
function sampleCoordinatesAlongRoute(coordinates, sampleCount = 6) {
  if (!coordinates || coordinates.length === 0) return [];
  if (coordinates.length <= sampleCount) return coordinates;

  const sampled = [];
  const step = (coordinates.length - 1) / (sampleCount - 1);
  for (let i = 0; i < sampleCount; i++) {
    const idx = Math.min(Math.round(i * step), coordinates.length - 1);
    sampled.push(coordinates[idx]);
  }
  return sampled;
}

function interpolateCoordinates(coordA, coordB, steps = 10) {
  const result = [];
  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    result.push([
      coordA[0] + (coordB[0] - coordA[0]) * frac,
      coordA[1] + (coordB[1] - coordA[1]) * frac
    ]);
  }
  return result;
}

function calculateDirectDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = {
  fetchOsrmRoutes,
  sampleCoordinatesAlongRoute,
  calculateDirectDistanceKm
};
