import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, MapPin, Compass, Clock, ArrowRight, Shield, Bell, Sparkles } from 'lucide-react';
import WeatherCard from '../components/weather/WeatherCard';
import CountUp from '../motion/CountUp';
import Reveal from '../motion/Reveal';
import Stagger, { StaggerItem } from '../motion/Stagger';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentWeather, setCurrentWeather] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [stats, setStats] = useState({ totalTrips: 0, completedTrips: 0, totalDistanceKm: 0 });
  const [loading, setLoading] = useState(true);

  // Quick plan form state
  const [quickOrigin, setQuickOrigin] = useState('');
  const [quickDest, setQuickDest] = useState('');

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const [stationName, setStationName] = useState('Local Weather Station');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { getCurrentAccurateLocation } = await import('../utils/locationHelper');
        const loc = await getCurrentAccurateLocation();
        setStationName(loc.formattedName || loc.name || 'Local Weather Station');
        setQuickOrigin(loc.formattedName || loc.name || '');

        // Fetch weather for accurate coordinates
        const weatherRes = await api.get(`/weather/current?lat=${loc.lat}&lng=${loc.lng}`);
        if (weatherRes.data.success) {
          setCurrentWeather(weatherRes.data.weather);
        }

        // Fetch recent trips
        const tripsRes = await api.get('/trips?limit=3');
        if (tripsRes.data.success) {
          setRecentTrips(tripsRes.data.trips);
        }

        // Fetch stats
        const statsRes = await api.get('/users/stats');
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
      } catch (err) {
        console.warn('[Dashboard data error]', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleQuickPlan = (e) => {
    e.preventDefault();
    if (!quickDest.trim()) return;
    navigate(`/plan-trip?dest=${encodeURIComponent(quickDest)}&orig=${encodeURIComponent(quickOrigin)}`);
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
            MeghaPrayan Telemetry Hub
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Traveler'} 👋
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time route weather and smart journey planner ready.
          </p>
        </div>

        <Link
          to="/plan-trip"
          className="inline-flex items-center space-x-2 px-5 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-sm hover:shadow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Journey</span>
        </Link>
      </div>

      {/* 2. Top Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black">
            🛣️
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              <CountUp end={stats.totalDistanceKm} suffix=" km" />
            </div>
            <div className="text-xs text-slate-600 font-medium">Logged Travel Corridor</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            ✅
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              <CountUp end={stats.completedTrips} />
            </div>
            <div className="text-xs text-slate-600 font-medium">Completed Safely</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            🌤️
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              <CountUp end={stats.totalTrips} />
            </div>
            <div className="text-xs text-slate-600 font-medium">Weather Evaluated Trips</div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Columns: Quick Plan & Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Plan Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Fast Route Planner</h2>
              <p className="text-xs text-slate-600">Quickly calculate road geometry and weather hazard score</p>
            </div>
            <Sparkles className="w-5 h-5 text-sky-500" />
          </div>

          <form onSubmit={handleQuickPlan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Starting Location
              </label>
              <input
                type="text"
                placeholder="Current Location (or type city, e.g. Bengaluru)"
                value={quickOrigin}
                onChange={(e) => setQuickOrigin(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Destination
              </label>
              <input
                type="text"
                required
                placeholder="Where are you going? (e.g. Mysuru)"
                value={quickDest}
                onChange={(e) => setQuickDest(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Launch Route & Weather Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick suggestions */}
          <div className="pt-4 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-600">
            <span className="font-semibold">Popular corridors:</span>
            <button
              type="button"
              onClick={() => { setQuickOrigin('Bengaluru'); setQuickDest('Mysuru'); }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors"
            >
              Bengaluru ➔ Mysuru
            </button>
            <button
              type="button"
              onClick={() => { setQuickOrigin('Mumbai'); setQuickDest('Pune'); }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition-colors"
            >
              Mumbai ➔ Pune
            </button>
          </div>
        </div>

        {/* Current Location Weather */}
        <div className="lg:col-span-5">
          {currentWeather ? (
            <WeatherCard weather={currentWeather} title={stationName} />
          ) : (
            <div className="bg-slate-50 rounded-2xl p-8 text-center animate-pulse border">
              Loading Open-Meteo feeds...
            </div>
          )}
        </div>
      </div>

      {/* 4. Recent Trips */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Journeys</h2>
            <p className="text-xs text-slate-600">Revisit past calculations or resume live tracking</p>
          </div>
          <Link to="/history" className="text-xs font-bold text-sky-600 hover:underline">
            View All ({stats.totalTrips})
          </Link>
        </div>

        {recentTrips.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <Compass className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No journeys logged yet</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Plan your first trip to evaluate microclimates and live Dijkstra route rankings.
            </p>
            <Link
              to="/plan-trip"
              className="inline-block mt-2 px-4 py-2 bg-sky-500 text-white font-semibold text-xs rounded-xl"
            >
              Plan Your First Journey
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentTrips.map((trip) => {
              const activeRoute = trip.routes && trip.routes[trip.selectedRouteIndex || 0];
              return (
                <div
                  key={trip._id}
                  onClick={() => navigate(`/trip/${trip._id}`)}
                  className="cursor-pointer p-5 rounded-2xl border border-slate-200/80 hover:border-sky-300 hover:shadow-sm transition-all space-y-3 bg-slate-50/50"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{trip.title || 'Road Journey'}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        trip.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="truncate">{trip.origin?.name}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="truncate">{trip.destination?.name}</span>
                    </div>
                  </div>

                  {activeRoute && (
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                      <span>{activeRoute.distanceKm} km</span>
                      <span className="font-bold text-sky-600">Score: {activeRoute.dijkstraScore}/100</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
