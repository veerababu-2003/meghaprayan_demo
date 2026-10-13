import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, CloudRain, Shield, MapPin, Sparkles, Navigation } from 'lucide-react';

export const Features = () => {
  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
          Engineering & Architecture
        </span>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          MeghaPrayan Technology Stack
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          How MeghaPrayan combines meteorological forecasting, shortest-path graph optimization, and WebSocket telemetry to deliver smart journeys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Multi-Factor Dijkstra Scoring</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Standard routing engines only optimize for speed or distance. MeghaPrayan constructs a directed graph of route segments where edge costs incorporate precipitation volume, crosswind speed, and temperature extremes.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CloudRain className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Open-Meteo High-Resolution Forecasting</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Waypoints along your path are sampled dynamically against Open-Meteo’s hourly weather model. We correlate each waypoint's predicted arrival time with localized meteorological predictions.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Adaptive Transport Recommendations</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Rule-based models analyze whether two-wheelers, automobiles, or transit are safe under anticipated weather hazards, clearly noted as smart app recommendations.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Navigation className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Real-Time Socket Telemetry</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Socket.IO rooms power live trip tracking, sending vehicle coordinates and fetching immediate radar updates as your geographic coordinates progress.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Features;
