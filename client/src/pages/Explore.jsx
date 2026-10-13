import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, CloudSun, MapPin, ArrowRight } from 'lucide-react';
import api from '../services/api';

const FEATURED_DESTINATIONS = [
  {
    name: 'Coorg, Karnataka',
    lat: 12.3375,
    lng: 75.8069,
    tag: 'Misty Hills',
    desc: 'Lush coffee plantations and winding highland curves.'
  },
  {
    name: 'Goa',
    lat: 15.2993,
    lng: 74.1240,
    tag: 'Coastal Breeze',
    desc: 'Golden shoreline routes and tropical marine weather.'
  },
  {
    name: 'Ooty, Tamil Nadu',
    lat: 11.4102,
    lng: 76.6950,
    tag: 'High Altitude',
    desc: 'Crisp mountain air, hair-pin turns, and dynamic cloud cover.'
  },
  {
    name: 'Munnar, Kerala',
    lat: 10.0889,
    lng: 77.0595,
    tag: 'Tea Valleys',
    desc: 'Emerald green tea terraces and gentle subtropical rainfall.'
  },
  {
    name: 'Jaipur, Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    tag: 'Desert Royalty',
    desc: 'Arid desert highways with clear horizons and intense sunshine.'
  },
  {
    name: 'Manali, Himachal Pradesh',
    lat: 32.2432,
    lng: 77.1892,
    tag: 'Himalayan Passes',
    desc: 'Alpine valleys with swift temperature drops and mountain winds.'
  }
];

export const Explore = () => {
  const navigate = useNavigate();
  const [destinationsWithWeather, setDestinationsWithWeather] = useState(FEATURED_DESTINATIONS);

  useEffect(() => {
    // Fetch live weather for each curated destination asynchronously
    const fetchAllWeather = async () => {
      const updated = await Promise.all(
        FEATURED_DESTINATIONS.map(async (dest) => {
          try {
            const res = await api.get(`/weather/current?lat=${dest.lat}&lng=${dest.lng}`);
            if (res.data.success) {
              return { ...dest, weather: res.data.weather };
            }
          } catch (e) {}
          return dest;
        })
      );
      setDestinationsWithWeather(updated);
    };

    fetchAllWeather();
  }, []);

  const handlePlanTo = (dest) => {
    navigate(`/plan-trip?dest=${encodeURIComponent(dest.name)}`);
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
          Curated Corridors
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
          Explore Weather-Optimized Destinations
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Discover handpicked destinations with live Open-Meteo meteorological telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinationsWithWeather.map((dest, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                  {dest.tag}
                </span>
                {dest.weather && (
                  <span className="text-sm font-black text-slate-900 flex items-center space-x-1">
                    <CloudSun className="w-4 h-4 text-amber-500" />
                    <span>{Math.round(dest.weather.temperature)}°C</span>
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-slate-900">{dest.name}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{dest.desc}</p>
            </div>

            {dest.weather && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>{dest.weather.conditionText}</span>
                <span className="font-semibold text-slate-700">
                  Rain: {dest.weather.precipitationProbability}%
                </span>
              </div>
            )}

            <button
              onClick={() => handlePlanTo(dest)}
              className="w-full py-2.5 bg-slate-100 hover:bg-sky-500 hover:text-white text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Calculate Journey Route</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;
