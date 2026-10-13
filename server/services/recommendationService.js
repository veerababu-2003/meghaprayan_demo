/**
 * Vehicle and safety recommendation engine based on distance, duration, and weather attributes.
 * Rule-based advisory clearly identified as an app recommendation, not guaranteed safety advice.
 */

function generateRecommendations({ distanceKm, durationMinutes, weatherPoints, selectedMode = 'car' }) {
  const flags = [];
  let peakWind = 0;
  let maxPrecipProb = 0;
  let hasThunderstorm = false;
  let maxTemp = -Infinity;
  let minTemp = Infinity;

  (weatherPoints || []).forEach(wp => {
    if (wp.windSpeed > peakWind) peakWind = wp.windSpeed;
    if (wp.precipitationProbability > maxPrecipProb) maxPrecipProb = wp.precipitationProbability;
    if ([95, 96, 99].includes(wp.weatherCode)) hasThunderstorm = true;
    if (wp.temperature > maxTemp) maxTemp = wp.temperature;
    if (wp.temperature < minTemp) minTemp = wp.temperature;
  });

  if (hasThunderstorm) {
    flags.push('Thunderstorm alert: Heavy gusts and lightning hazard on route.');
  }
  if (maxPrecipProb > 65) {
    flags.push(`High rain probability (${maxPrecipProb}%): Wet road surface, reduced tyre grip.`);
  }
  if (peakWind > 40) {
    flags.push(`Gusty crosswinds up to ${Math.round(peakWind)} km/h detected.`);
  }
  if (maxTemp > 38) {
    flags.push(`High heat conditions (${maxTemp}°C): Stay hydrated and monitor engine coolant.`);
  }
  if (minTemp < 3) {
    flags.push(`Near-freezing temperatures (${minTemp}°C): Beware of early morning black ice.`);
  }

  // Determine vehicle suitability
  let recommendedVehicle = 'Four-Wheeler / Car';
  let advice = '';

  if (distanceKm > 60 || hasThunderstorm || maxPrecipProb > 50 || peakWind > 35) {
    recommendedVehicle = 'Car / Enclosed Vehicle';
    advice = 'Four-wheel enclosed travel is strongly advised due to distance or inclement weather risks. Two-wheelers face significant exposure to rain and crosswinds.';
  } else if (distanceKm <= 5 && maxPrecipProb < 30 && peakWind < 20) {
    recommendedVehicle = 'Walking / Bicycle / Two-Wheeler';
    advice = 'Short trip with mild atmospheric conditions. Walking or cycling is viable and low-carbon.';
  } else if (distanceKm <= 35 && maxPrecipProb < 35 && peakWind < 25) {
    recommendedVehicle = 'Motorcycle / Scooter / Car';
    advice = 'Favorable weather conditions along the corridor. Two-wheel travel is comfortable with standard protective gear.';
  } else {
    recommendedVehicle = 'Car / Public Transit';
    advice = 'Variable weather patterns ahead. Enclosed travel provides optimal safety and consistency.';
  }

  return {
    recommendedVehicle,
    advice,
    cautionFlags: flags,
    disclaimer: 'App recommendation based on real-time meteorological models, not guaranteed safety advice.'
  };
}

module.exports = {
  generateRecommendations
};
