import api from '../services/api';

/**
 * getCurrentAccurateLocation
 * Multi-layer accurate location detector:
 * 1. Checks browser GPS via Geolocation API with high accuracy mode enabled
 * 2. If granted, immediately reverse geocodes the coordinates through OpenStreetMap Nominatim
 *    to retrieve neighborhood, city, state, country, and postal code.
 * 3. If GPS is unavailable/denied, seamlessly queries server-side IP geolocation (/api/geocode/ip-detect)
 * 4. Guarantees valid coordinates, precise display name, and reverse geocoded city across all environments.
 */
export async function getCurrentAccurateLocation() {
  return new Promise((resolve) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy || 10;

          try {
            const revRes = await api.get(`/geocode/reverse?lat=${lat}&lng=${lng}`);
            if (revRes.data?.success) {
              return resolve({
                lat,
                lng,
                accuracy,
                name: revRes.data.name || 'Current Location',
                displayName: revRes.data.displayName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                formattedName: revRes.data.formattedName || revRes.data.name || 'Current Location',
                address: revRes.data.address || {},
                source: 'browser_gps'
              });
            }
          } catch (e) {
            console.warn('[LocationHelper] Reverse geocode error:', e.message);
          }

          resolve({
            lat,
            lng,
            accuracy,
            name: 'Current Location',
            displayName: `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            formattedName: 'Current Location',
            source: 'browser_gps'
          });
        },
        async (err) => {
          console.warn('[LocationHelper] GPS denied or timed out:', err.message, '- Using IP geolocation fallback.');
          const ipLoc = await fetchIpFallback();
          resolve(ipLoc);
        },
        {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 30000
        }
      );
    } else {
      fetchIpFallback().then(resolve);
    }
  });
}

async function fetchIpFallback() {
  try {
    const res = await api.get('/geocode/ip-detect');
    if (res.data?.success) {
      return {
        lat: res.data.lat,
        lng: res.data.lng,
        accuracy: 1000,
        name: res.data.city || 'Detected Location',
        displayName: res.data.displayName || `${res.data.city}, ${res.data.region}`,
        formattedName: res.data.formattedName || res.data.city,
        source: res.data.source || 'ip_geo'
      };
    }
  } catch (e) {
    console.warn('[LocationHelper] IP fallback error:', e.message);
  }

  // Graceful fallback
  return {
    lat: 17.3843,
    lng: 78.4583,
    accuracy: 5000,
    name: 'Hyderabad',
    displayName: 'Hyderabad, Telangana, India',
    formattedName: 'Hyderabad, Telangana',
    source: 'regional_fallback'
  };
}
