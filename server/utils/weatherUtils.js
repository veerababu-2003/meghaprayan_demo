// WMO Weather Interpretation Codes (WW)
// https://open-meteo.com/en/docs
const WMO_CODES = {
  0: { label: 'Clear sky', icon: 'Sun', risk: 'low' },
  1: { label: 'Mainly clear', icon: 'Sun', risk: 'low' },
  2: { label: 'Partly cloudy', icon: 'CloudSun', risk: 'low' },
  3: { label: 'Overcast', icon: 'Cloud', risk: 'low' },
  45: { label: 'Fog', icon: 'CloudFog', risk: 'moderate' },
  48: { label: 'Depositing rime fog', icon: 'CloudFog', risk: 'moderate' },
  51: { label: 'Light drizzle', icon: 'CloudDrizzle', risk: 'moderate' },
  53: { label: 'Moderate drizzle', icon: 'CloudDrizzle', risk: 'moderate' },
  55: { label: 'Dense drizzle', icon: 'CloudDrizzle', risk: 'moderate' },
  56: { label: 'Freezing drizzle', icon: 'CloudSnow', risk: 'high' },
  57: { label: 'Dense freezing drizzle', icon: 'CloudSnow', risk: 'high' },
  61: { label: 'Slight rain', icon: 'CloudRain', risk: 'moderate' },
  63: { label: 'Moderate rain', icon: 'CloudRain', risk: 'moderate' },
  65: { label: 'Heavy rain', icon: 'CloudRain', risk: 'high' },
  66: { label: 'Light freezing rain', icon: 'CloudSnow', risk: 'high' },
  67: { label: 'Heavy freezing rain', icon: 'CloudSnow', risk: 'severe' },
  71: { label: 'Slight snow fall', icon: 'Snowflake', risk: 'high' },
  73: { label: 'Moderate snow fall', icon: 'Snowflake', risk: 'high' },
  75: { label: 'Heavy snow fall', icon: 'Snowflake', risk: 'severe' },
  77: { label: 'Snow grains', icon: 'Snowflake', risk: 'high' },
  80: { label: 'Slight rain showers', icon: 'CloudRain', risk: 'moderate' },
  81: { label: 'Moderate rain showers', icon: 'CloudRain', risk: 'high' },
  82: { label: 'Violent rain showers', icon: 'CloudRain', risk: 'severe' },
  85: { label: 'Slight snow showers', icon: 'Snowflake', risk: 'high' },
  86: { label: 'Heavy snow showers', icon: 'Snowflake', risk: 'severe' },
  95: { label: 'Thunderstorm', icon: 'CloudLightning', risk: 'high' },
  96: { label: 'Thunderstorm with slight hail', icon: 'CloudLightning', risk: 'severe' },
  99: { label: 'Thunderstorm with heavy hail', icon: 'CloudLightning', risk: 'severe' }
};

/**
 * Get description & risk assessment for a WMO weather code
 */
function getWeatherInfo(code) {
  return WMO_CODES[code] || { label: 'Partly cloudy', icon: 'CloudSun', risk: 'low' };
}

/**
 * Calculate weather safety risk factor [0.0 - 1.0] based on conditions
 */
function computeWeatherRisk(temp, precipProb, precipAmount, windSpeed, weatherCode) {
  let riskScore = 0.0;
  const reasons = [];

  // Precipitation factor
  if (precipAmount > 10 || precipProb > 80) {
    riskScore += 0.45;
    reasons.push('Heavy precipitation expected');
  } else if (precipAmount > 2.5 || precipProb > 50) {
    riskScore += 0.25;
    reasons.push('Scattered rain/drizzle anticipated');
  }

  // Wind factor
  if (windSpeed > 45) {
    riskScore += 0.35;
    reasons.push(`Strong gusty winds (${Math.round(windSpeed)} km/h)`);
  } else if (windSpeed > 25) {
    riskScore += 0.15;
    reasons.push(`Moderate winds (${Math.round(windSpeed)} km/h)`);
  }

  // Extreme temperature factor
  if (temp > 40) {
    riskScore += 0.25;
    reasons.push(`Extreme heatwave condition (${temp.toFixed(1)}°C)`);
  } else if (temp < 0) {
    riskScore += 0.30;
    reasons.push(`Sub-zero freeze hazard (${temp.toFixed(1)}°C)`);
  }

  // Thunderstorms / Hail
  if ([95, 96, 99].includes(weatherCode)) {
    riskScore += 0.50;
    reasons.push('Thunderstorm & lightning danger');
  }

  riskScore = Math.min(1.0, riskScore);

  let riskLevel = 'low';
  if (riskScore >= 0.7) riskLevel = 'severe';
  else if (riskScore >= 0.4) riskLevel = 'high';
  else if (riskScore >= 0.2) riskLevel = 'moderate';

  return {
    score: Number(riskScore.toFixed(2)),
    level: riskLevel,
    reason: reasons.length > 0 ? reasons.join('. ') : 'Favorable, clear travel conditions'
  };
}

module.exports = {
  WMO_CODES,
  getWeatherInfo,
  computeWeatherRisk
};
