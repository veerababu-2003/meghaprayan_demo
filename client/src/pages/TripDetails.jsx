import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Bookmark, Heart, Share2, Compass, Clock, ShieldAlert, Sparkles, Check } from 'lucide-react';
import InteractiveMap from '../components/map/InteractiveMap';
import RouteWeatherTimeline from '../components/weather/RouteWeatherTimeline';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [trip, setTrip] = useState(null);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get(`/trips/${id}`);
        if (res.data.success) {
          setTrip(res.data.trip);
          setSelectedRouteIdx(res.data.trip.selectedRouteIndex || 0);
          setIsFavorite(res.data.trip.isFavorite || false);
        }
      } catch (err) {
        addToast('Failed to load trip details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleStartTrip = async () => {
    try {
      const res = await api.post(`/trips/${id}/start`);
      if (res.data.success) {
        addToast('Live journey tracking started!', 'success');
        navigate(`/live-trip/${id}`);
      }
    } catch (err) {
      addToast('Error starting live trip', 'error');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (!isFavorite) {
        await api.post('/favorites', {
          type: 'trip',
          title: trip.title,
          data: { tripId: trip._id }
        });
        setIsFavorite(true);
        addToast('Added to favorites!', 'success');
      } else {
        setIsFavorite(false);
        addToast('Removed from favorites', 'info');
      }
    } catch (err) {
      addToast('Error updating favorites', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: trip?.title || 'MeghaPrayan Trip',
        text: `Check out my weather-aware journey from ${trip?.origin?.name} to ${trip?.destination?.name}!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      addToast('Trip link copied to clipboard!', 'info');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
        <div className="animate-pulse space-y-4 max-w-md mx-auto">
          <div className="h-8 bg-slate-200 rounded w-2/3 mx-auto"></div>
          <div className="h-64 bg-slate-100 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Trip not found</h2>
        <Link to="/plan-trip" className="text-sky-600 text-sm font-semibold underline">
          Plan a new trip
        </Link>
      </div>
    );
  }

  const activeRoute = trip.routes[selectedRouteIdx] || trip.routes[0];

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {trip.title}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Mode: <span className="font-semibold capitalize">{trip.mode}</span> • Departure:{' '}
            {new Date(trip.departureTime).toLocaleDateString()} at{' '}
            {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={handleToggleFavorite}
            className={`p-3 rounded-2xl border transition-all ${
              isFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-600 hover:text-rose-500'
            }`}
            title="Favorite"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-3 bg-white border border-slate-200 hover:border-sky-300 text-slate-600 hover:text-sky-600 rounded-2xl transition-all"
            title="Share Journey"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
          </button>

          <button
            onClick={handleStartTrip}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center space-x-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Live Trip</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Map & Traveling Marker */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <InteractiveMap
          routes={trip.routes}
          selectedRouteIndex={selectedRouteIdx}
          origin={trip.origin}
          destination={trip.destination}
          enableTravelingMarker={true}
          className="h-[460px] w-full rounded-2xl overflow-hidden"
        />

        {/* Route Stats Ribbon */}
        {activeRoute && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Total Distance
              </span>
              <span className="text-xl font-black text-slate-900">{activeRoute.distanceKm} km</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Est. Duration
              </span>
              <span className="text-xl font-black text-slate-900">
                {Math.floor(activeRoute.durationMinutes / 60)}h {activeRoute.durationMinutes % 60}m
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Dijkstra Safety Score
              </span>
              <span className="text-xl font-black text-sky-600">{activeRoute.dijkstraScore}/100</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Status
              </span>
              <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                {trip.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Weather Along Route */}
      {activeRoute?.weatherPoints && (
        <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xs">
          <RouteWeatherTimeline weatherPoints={activeRoute.weatherPoints} />
        </div>
      )}

      {/* 4. Dijkstra Logic Transparency */}
      {activeRoute?.dijkstraExplanation && (
        <div className="bg-sky-50/70 border border-sky-200 rounded-3xl p-6 space-y-2">
          <div className="flex items-center space-x-2 text-sky-800 text-sm font-bold">
            <Compass className="w-5 h-5 text-sky-600" />
            <span>Route Optimization Rationale</span>
          </div>
          <p className="text-xs text-sky-900/90 leading-relaxed">
            {activeRoute.dijkstraExplanation}
          </p>
          <span className="text-[10px] text-sky-700 italic block pt-1">
            * Note: Road geometries and duration estimates are computed via OSRM. Weather points are fetched from Open-Meteo.
          </span>
        </div>
      )}
    </div>
  );
};

export default TripDetails;
