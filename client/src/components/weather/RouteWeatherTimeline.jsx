import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Droplets, Wind, AlertTriangle } from 'lucide-react';

export const RouteWeatherTimeline = ({ weatherPoints = [], className = '' }) => {
  if (!weatherPoints || weatherPoints.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-600 bg-slate-50 rounded-2xl border border-slate-100">
        No route waypoint weather sampled yet.
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Weather Along Route Timeline
        </h4>
        <span className="text-xs text-slate-600 font-medium">
          {weatherPoints.length} Atmospheric checkpoints
        </span>
      </div>

      <div className="overflow-x-auto pb-4 pt-1">
        <div className="flex items-center space-x-4 min-w-max">
          {weatherPoints.map((point, index) => {
            const timeStr = point.estimatedTimeArrival
              ? new Date(point.estimatedTimeArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : `Point ${index + 1}`;

            const isRisky = point.riskLevel === 'high' || point.riskLevel === 'severe';

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, type: 'spring', stiffness: 280, damping: 22 }}
                className={`w-48 p-4 rounded-2xl border transition-all ${
                  isRisky
                    ? 'bg-rose-50/70 border-rose-200 shadow-sm'
                    : 'bg-white border-slate-200 shadow-xs hover:border-sky-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    <span>{timeStr}</span>
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isRisky ? 'bg-rose-200 text-rose-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {index === 0 ? 'Start' : index === weatherPoints.length - 1 ? 'Arrival' : `+${index * 20}m`}
                  </span>
                </div>

                <div className="my-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-800">
                    {Math.round(point.temperature)}°C
                  </span>
                  <span className="text-xs font-semibold text-slate-600 text-right truncate max-w-[90px]">
                    {point.conditionText}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    <span className="font-medium text-slate-700">{point.precipitationProbability || 0}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Wind className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">{Math.round(point.windSpeed || 0)}km/h</span>
                  </div>
                </div>

                {isRisky && (
                  <div className="mt-2.5 flex items-center space-x-1 text-[11px] font-semibold text-rose-600 bg-rose-100/60 p-1.5 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{point.riskReason || 'Hazardous weather'}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RouteWeatherTimeline;
