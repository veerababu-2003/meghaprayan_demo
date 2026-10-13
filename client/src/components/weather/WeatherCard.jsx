import React from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, CloudFog, Snowflake, Wind, Droplets } from 'lucide-react';
import WeatherParticles from '../../motion/WeatherParticles';

export const WeatherCard = ({
  weather,
  title = 'Current Conditions',
  showParticles = true,
  className = ''
}) => {
  if (!weather) return null;

  const getWeatherIcon = (code) => {
    if ([0, 1].includes(code)) return <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />;
    if ([2, 3].includes(code)) return <Cloud className="w-8 h-8 text-sky-400" />;
    if ([45, 48].includes(code)) return <CloudFog className="w-8 h-8 text-slate-400" />;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain className="w-8 h-8 text-sky-500" />;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return <Snowflake className="w-8 h-8 text-indigo-400" />;
    if ([95, 96, 99].includes(code)) return <CloudLightning className="w-8 h-8 text-amber-600" />;
    return <Cloud className="w-8 h-8 text-sky-400" />;
  };

  const getParticleCondition = (code) => {
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rain';
    if ([2, 3, 45, 48].includes(code)) return 'cloud';
    if ([0, 1].includes(code)) return 'sun';
    return 'wind';
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-sky-50/50 p-6 shadow-sm border border-sky-100 ${className}`}>
      {showParticles && (
        <WeatherParticles condition={getParticleCondition(weather.weatherCode)} density="low" />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            {title}
          </span>
          {weather.riskLevel && (
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                weather.riskLevel === 'severe'
                  ? 'bg-rose-100 text-rose-700'
                  : weather.riskLevel === 'high'
                  ? 'bg-amber-100 text-amber-700'
                  : weather.riskLevel === 'moderate'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              Risk: {weather.riskLevel.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {Math.round(weather.temperature)}°C
            </div>
            <div className="text-sm font-medium text-slate-600 mt-1">
              {weather.conditionText || 'Clear'}
            </div>
          </div>
          <div className="p-3 bg-white/80 rounded-2xl shadow-sm border border-slate-100">
            {getWeatherIcon(weather.weatherCode)}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
          <div className="flex flex-col items-center">
            <Droplets className="w-4 h-4 text-sky-500 mb-1" />
            <span className="text-[11px] text-slate-600">Rain Prob</span>
            <span className="text-xs font-bold text-slate-800">{weather.precipitationProbability || 0}%</span>
          </div>
          <div className="flex flex-col items-center">
            <Wind className="w-4 h-4 text-slate-400 mb-1" />
            <span className="text-[11px] text-slate-600">Wind</span>
            <span className="text-xs font-bold text-slate-800">{Math.round(weather.windSpeed || 0)} km/h</span>
          </div>
          <div className="flex flex-col items-center">
            <Cloud className="w-4 h-4 text-indigo-400 mb-1" />
            <span className="text-[11px] text-slate-600">Humidity</span>
            <span className="text-xs font-bold text-slate-800">{weather.relativeHumidity || 50}%</span>
          </div>
        </div>

        {weather.riskReason && (
          <p className="mt-3 text-xs text-slate-500 italic bg-white/60 p-2 rounded-lg border border-slate-100">
            {weather.riskReason}
          </p>
        )}
      </div>
    </div>
  );
};

export default WeatherCard;
