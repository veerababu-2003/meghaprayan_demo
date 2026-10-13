const axios = require('axios');
const cache = require('../services/cacheService');

// @desc    Geocode autocomplete search via Nominatim with short-TTL cache
// @route   GET /api/geocode/search?q=query
exports.searchPlaces = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length < 2) {
      return res.status(200).json({ success: true, results: [] });
    }

    const cleanQuery = query.trim().toLowerCase();
    const cacheKey = `geo_${cleanQuery}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.status(200).json({ success: true, results: cached, fromCache: true });
    }

    // Call OpenStreetMap Nominatim with proper User-Agent
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&limit=7&addressdetails=1`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'MeghaPrayan-TravelPlatform/1.0 (contact: admin@meghaprayan.local)'
      },
      timeout: 6000
    });

    const results = (response.data || []).map(item => ({
      placeId: item.place_id,
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
      importance: item.importance
    }));

    cache.set(cacheKey, results, 3600); // 1 hour cache
    res.status(200).json({ success: true, results });
  } catch (error) {
    console.warn(`[GeocodeController] Search error: ${error.message}`);
    // Safe graceful empty fallback
    res.status(200).json({ success: true, results: [] });
  }
};

// @desc    Reverse geocode coordinates to accurate street/city address
// @route   GET /api/geocode/reverse?lat=..&lng=..
exports.reverseGeocode = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    const cacheKey = `reverse_${parseFloat(lat).toFixed(4)}_${parseFloat(lng).toFixed(4)}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, ...cached, fromCache: true });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=16&addressdetails=1`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'MeghaPrayan-TravelPlatform/1.0 (contact: admin@meghaprayan.local)'
      },
      timeout: 6000
    });

    const data = response.data;
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.suburb || address.county || address.state_district || 'Local Area';
    const state = address.state || '';
    const country = address.country || '';
    const formattedCity = [city, state].filter(Boolean).join(', ');

    const result = {
      displayName: data.display_name || formattedCity,
      name: city,
      formattedName: formattedCity,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address
    };

    cache.set(cacheKey, result, 3600);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.warn(`[GeocodeController] Reverse geocode error: ${error.message}`);
    res.status(200).json({
      success: true,
      displayName: `Coordinates (${parseFloat(req.query.lat).toFixed(4)}, ${parseFloat(req.query.lng).toFixed(4)})`,
      name: 'Current Location',
      formattedName: 'Current Location',
      lat: parseFloat(req.query.lat),
      lng: parseFloat(req.query.lng)
    });
  }
};

// @desc    Detect location by IP address as high-accuracy secondary fallback
// @route   GET /api/geocode/ip-detect
exports.detectLocationByIp = async (req, res, next) => {
  try {
    // Query external IP geolocation API
    const response = await axios.get('http://ip-api.com/json', { timeout: 4000 });
    const data = response.data;

    if (data && data.status === 'success') {
      const city = data.city || '';
      const region = data.regionName || '';
      const country = data.country || '';
      const formattedName = [city, region, country].filter(Boolean).join(', ');

      return res.status(200).json({
        success: true,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
        city,
        region,
        country,
        formattedName,
        displayName: formattedName,
        source: 'ip_geo'
      });
    }

    throw new Error('IP lookup returned non-success status');
  } catch (error) {
    console.warn(`[GeocodeController] IP Detection error: ${error.message}`);
    // Safe standard default
    res.status(200).json({
      success: true,
      lat: 17.3843,
      lng: 78.4583,
      city: 'Hyderabad',
      region: 'Telangana',
      country: 'India',
      formattedName: 'Hyderabad, Telangana, India',
      displayName: 'Hyderabad, Telangana, India',
      source: 'fallback'
    });
  }
};
