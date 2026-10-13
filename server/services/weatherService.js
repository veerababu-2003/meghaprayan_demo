const axios = require('axios');
const cache = require('./cacheService');
const { getWeatherInfo, computeWeatherRisk } = require('../utils/weatherUtils');

/**
 * Fetch current weather and hourly forecast from Open-Meteo
 * Open-Meteo requires no API key and provides reliable global hourly forecasts.
 */
async function fetchPointWeather(lat, lng, targetTime = null) {
  const cacheKey = `weather_${Number(lat).toFixed(3)}_${Number(lng).toFixed(3)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&timezone=auto&forecast_days=3`;
    
    const response = await axios.get(url, { timeout: 8000 });
    const data = response.data;

    let targetTemp = data.current.temperature_2m;
    let targetCode = data.current.weather_code;
    let targetPrecip = data.current.precipitation;
    let targetPrecipProb = 0;
    let targetWind = data.current.wind_speed_10m;
    let targetHumidity = data.current.relative_humidity_2m;

    // If a target arrival time is provided, find the closest matching hourly entry
    if (targetTime && data.hourly && data.hourly.time) {
      const targetDate = new Date(targetTime).getTime();
      let closestIdx = 0;
      let minDiff = Infinity;

      data.hourly.time.forEach((tStr, idx) => {
        const timeDiff = Math.abs(new Date(tStr).getTime() - targetDate);
        if (timeDiff < minDiff) {
          minDiff = timeDiff;
          closestIdx = idx;
        }
      });

      if (closestIdx !== -1) {
        targetTemp = data.hourly.temperature_2m[closestIdx];
        targetCode = data.hourly.weather_code[closestIdx];
        targetPrecip = data.hourly.precipitation[closestIdx];
        targetPrecipProb = data.hourly.precipitation_probability ? data.hourly.precipitation_probability[closestIdx] : 0;
        targetWind = data.hourly.wind_speed_10m[closestIdx];
      }
    }

    const weatherMeta = getWeatherInfo(targetCode);
    const risk = computeWeatherRisk(targetTemp, targetPrecipProb, targetPrecip, targetWind, targetCode);

    const result = {
      lat: Number(lat),
      lng: Number(lng),
      temperature: Math.round(targetTemp * 10) / 10,
      weatherCode: targetCode,
      conditionText: weatherMeta.label,
      conditionIcon: weatherMeta.icon,
      precipitationProbability: Math.round(targetPrecipProb),
      precipitation: Math.round(targetPrecip * 10) / 10,
      windSpeed: Math.round(targetWind * 10) / 10,
      relativeHumidity: Math.round(targetHumidity),
      riskScore: risk.score,
      riskLevel: risk.level,
      riskReason: risk.reason,
      hourlyForecast: data.hourly ? {
        time: data.hourly.time.slice(0, 24),
        temperature: data.hourly.temperature_2m.slice(0, 24),
        precipitationProbability: data.hourly.precipitation_probability ? data.hourly.precipitation_probability.slice(0, 24) : [],
        weatherCode: data.hourly.weather_code.slice(0, 24)
      } : null
    };

    cache.set(cacheKey, result, 900); // 15 mins cache
    return result;
  } catch (error) {
    console.error(`[WeatherService] Error fetching weather for ${lat},${lng}:`, error.message);
    // Return standard fallback if network or rate limit fails
    return {
      lat: Number(lat),
      lng: Number(lng),
      temperature: 24,
      weatherCode: 1,
      conditionText: 'Mainly clear',
      conditionIcon: 'Sun',
      precipitationProbability: 10,
      precipitation: 0,
      windSpeed: 12,
      relativeHumidity: 55,
      riskScore: 0.1,
      riskLevel: 'low',
      riskReason: 'Default baseline conditions'
    };
  }
}

/**
 * Sample weather at key points along an interpolated route
 */
async function fetchWeatherAlongCoordinates(sampledCoords, departureTime = new Date(), totalDurationMinutes = 60) {
  const points = [];
  const count = sampledCoords.length;

  for (let i = 0; i < count; i++) {
    const [lng, lat] = sampledCoords[i];
    const segmentFraction = count > 1 ? i / (count - 1) : 0;
    const arrivalTime = new Date(new Date(departureTime).getTime() + segmentFraction * totalDurationMinutes * 60000);

    const weather = await fetchPointWeather(lat, lng, arrivalTime);
    points.push({
      ...weather,
      pointIndex: i,
      estimatedTimeArrival: arrivalTime
    });
  }

  return points;
}

module.exports = {
  fetchPointWeather,
  fetchWeatherAlongCoordinates
};
