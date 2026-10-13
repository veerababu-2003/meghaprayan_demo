import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Car, Bike, Footprints, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, Bookmark } from 'lucide-react';
import InteractiveMap from '../components/map/InteractiveMap';
import RouteWeatherTimeline from '../components/weather/RouteWeatherTimeline';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const PlanTrip = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  // Location inputs & geocoding suggestions
  const [originQuery, setOriginQuery] = useState(searchParams.get('orig') || 'Bengaluru, Karnataka');
  const [destQuery, setDestQuery] = useState(searchParams.get('dest') || 'Mysuru, Karnataka');
  const [originPlace, setOriginPlace] = useState({ name: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946 });
  const [destPlace, setDestPlace] = useState({ name: 'Mysuru, Karnataka', lat: 12.2958, lng: 76.6394 });

  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);

  const [mode, setMode] = useState('car'); // car, bike, walking
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().slice(0, 16));

  // Calculation state
  const [calculating, setCalculating] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [savingTrip, setSavingTrip] = useState(false);

  // Debounce autocomplete search
  useEffect(() => {
    if (originQuery.length < 3) {
      setOriginSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/geocode/search?q=${encodeURIComponent(originQuery)}`);
        if (res.data.success) setOriginSuggestions(res.data.results);
      } catch (e) {}
    }, 400);
    return () => clearTimeout(timer);
  }, [originQuery]);

  useEffect(() => {
    if (destQuery.length < 3) {
      setDestSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/geocode/search?q=${encodeURIComponent(destQuery)}`);
        if (res.data.success) setDestSuggestions(res.data.results);
      } catch (e) {}
    }, 400);
    return () => clearTimeout(timer);
  }, [destQuery]);

  // Initial calculation on mount or when searchParams change
  useEffect(() => {
    const origParam = searchParams.get('orig');
    const destParam = searchParams.get('dest');

    const initializeFromParams = async () => {
      let currentOrig = originPlace;
      let currentDest = destPlace;

      if (origParam) {
        setOriginQuery(origParam);
        try {
          const res = await api.get(`/geocode/search?q=${encodeURIComponent(origParam)}`);
          if (res.data?.results?.[0]) {
            currentOrig = {
              name: res.data.results[0].displayName,
              lat: res.data.results[0].lat,
              lng: res.data.results[0].lng
            };
            setOriginPlace(currentOrig);
          }
        } catch (e) {}
      } else {
        // Automatically fetch user's accurate location as origin
        try {
          const { getCurrentAccurateLocation } = await import('../utils/locationHelper');
          const loc = await getCurrentAccurateLocation();
          currentOrig = {
            name: loc.displayName || loc.formattedName || 'Current Location',
            lat: loc.lat,
            lng: loc.lng
          };
          setOriginPlace(currentOrig);
          setOriginQuery(loc.formattedName || loc.name || 'Current Location');
        } catch (e) {}
      }

      if (destParam) {
        setDestQuery(destParam);
        try {
          const res = await api.get(`/geocode/search?q=${encodeURIComponent(destParam)}`);
          if (res.data?.results?.[0]) {
            currentDest = {
              name: res.data.results[0].displayName,
              lat: res.data.results[0].lat,
              lng: res.data.results[0].lng
            };
            setDestPlace(currentDest);
          }
        } catch (e) {}
      }

      calculateRouteForPlaces(currentOrig, currentDest);
    };

    initializeFromParams();
  }, [searchParams]);

  const calculateRouteForPlaces = async (origin, dest) => {
    const o = origin || originPlace;
    const d = dest || destPlace;
    if (!o || !d) return;

    setCalculating(true);
    try {
      const res = await api.post('/routes/calculate', {
        origin: o,
        destination: d,
        mode,
        departureTime: departureDate
      });

      if (res.data.success && res.data.routes?.length > 0) {
        setRoutes(res.data.routes);
        setSelectedRouteIdx(0);
        addToast(`Computed ${res.data.routes.length} candidate route(s) with weather models!`, 'success');
      } else {
        addToast('No routes found between selected locations', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error calculating routes', 'error');
    } finally {
      setCalculating(false);
    }
  };

  const calculateRoute = () => calculateRouteForPlaces(originPlace, destPlace);

  const handleSaveTrip = async () => {
    if (routes.length === 0) return;
    setSavingTrip(true);
    try {
      const selectedRoute = routes[selectedRouteIdx];
      const res = await api.post('/trips', {
        title: `${originPlace.name.split(',')[0]} to ${destPlace.name.split(',')[0]}`,
        origin: originPlace,
        destination: destPlace,
        mode,
        departureTime: departureDate,
        routes,
        selectedRouteIndex: selectedRouteIdx
      });

      if (res.data.success) {
        addToast('Journey saved to your profile!', 'success');
        navigate(`/trip/${res.data.trip._id}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving trip', 'error');
    } finally {
      setSavingTrip(false);
    }
  };

  const handleMapClick = (latlng) => {
    // Allows setting destination by clicking directly on map
    setDestPlace({
      name: `Point (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
      lat: latlng.lat,
      lng: latlng.lng
    });
    setDestQuery(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
    addToast('Destination set via map click', 'info');
  };

  const activeRoute = routes[selectedRouteIdx] || routes[0];

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
          Intelligent Waypoint Planner
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
          Plan Weather-Aware Journey
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Calculate multi-route corridors, sample real-time Open-Meteo forecasts, and evaluate Dijkstra risk scores.
        </p>
      </div>

      {/* 2. Planner Controls & Map Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            {/* Origin Autocomplete */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Origin (Start Location)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={originQuery}
                  onChange={(e) => setOriginQuery(e.target.value)}
                  placeholder="Search city, town, or landmark..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                />
                <MapPin className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
              </div>

              {/* Suggestions Dropdown */}
              {originSuggestions.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                  {originSuggestions.map((sug) => (
                    <div
                      key={sug.placeId}
                      onClick={() => {
                        setOriginPlace({ name: sug.displayName, lat: sug.lat, lng: sug.lng });
                        setOriginQuery(sug.displayName);
                        setOriginSuggestions([]);
                      }}
                      className="p-3 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 cursor-pointer border-b border-slate-50 last:border-none"
                    >
                      {sug.displayName}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Autocomplete */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Destination (Arrival Location)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                  placeholder="Search destination or tap on map..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                />
                <Navigation className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
              </div>

              {/* Suggestions Dropdown */}
              {destSuggestions.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                  {destSuggestions.map((sug) => (
                    <div
                      key={sug.placeId}
                      onClick={() => {
                        setDestPlace({ name: sug.displayName, lat: sug.lat, lng: sug.lng });
                        setDestQuery(sug.displayName);
                        setDestSuggestions([]);
                      }}
                      className="p-3 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 cursor-pointer border-b border-slate-50 last:border-none"
                    >
                      {sug.displayName}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transport Mode & Time */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Vehicle Mode
                </label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMode('car')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 ${
                      mode === 'car' ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Car</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('bike')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 ${
                      mode === 'bike' ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Bike</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('walking')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 ${
                      mode === 'walking' ? 'bg-white text-sky-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    <Footprints className="w-3.5 h-3.5" />
                    <span>Walk</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Departure Time
                </label>
                <input
                  type="datetime-local"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Calculate Button */}
            <button
              type="button"
              onClick={calculateRoute}
              disabled={calculating}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
              <span>{calculating ? 'Recalculating Atmospheric Corridors...' : 'Calculate Routes & Weather'}</span>
            </button>
          </div>

          {/* Candidate Routes Selection List */}
          {routes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Candidate Routes ({routes.length} Available)
              </h3>
              {routes.map((rt, idx) => {
                const isSelected = selectedRouteIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedRouteIdx(idx)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-50/70 border-sky-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-sky-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{rt.title}</span>
                        {rt.isRecommended && (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Recommended
                          </span>
                        )}
                        {rt.isFastest && (
                          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Fastest
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-sky-600">{rt.dijkstraScore}</span>
                        <span className="text-[10px] text-slate-600 font-bold">/100</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-slate-600 mt-2">
                      <span>{rt.distanceKm} km</span>
                      <span>•</span>
                      <span>{Math.floor(rt.durationMinutes / 60)}h {rt.durationMinutes % 60}m</span>
                      <span>•</span>
                      <span className="text-slate-600">{rt.summary}</span>
                    </div>

                    {rt.dijkstraExplanation && (
                      <p className="mt-2 text-[11px] text-slate-600 italic bg-white/70 p-2 rounded-lg border border-slate-100">
                        {rt.dijkstraExplanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Map & Route Overview */}
        <div className="lg:col-span-7 space-y-6">
          <InteractiveMap
            routes={routes}
            selectedRouteIndex={selectedRouteIdx}
            origin={originPlace}
            destination={destPlace}
            onMapClick={handleMapClick}
            enableTravelingMarker={true}
            className="h-[440px] w-full rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
          />

          {/* Vehicle Recommendation Card */}
          {activeRoute?.vehicleRecommendation && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Transport Mode Advisory</span>
                </span>
                <span className="text-xs font-extrabold text-slate-800">
                  {activeRoute.vehicleRecommendation.recommendedVehicle}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeRoute.vehicleRecommendation.advice}
              </p>
              {activeRoute.vehicleRecommendation.cautionFlags?.length > 0 && (
                <div className="space-y-1 pt-1">
                  {activeRoute.vehicleRecommendation.cautionFlags.map((flag, fIdx) => (
                    <div key={fIdx} className="flex items-center space-x-1.5 text-xs text-amber-700 bg-amber-50 p-1.5 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              )}
              <span className="text-[10px] text-slate-600 italic block pt-1">
                {activeRoute.vehicleRecommendation.disclaimer}
              </span>
            </div>
          )}

          {/* Action Row */}
          {routes.length > 0 && (
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleSaveTrip}
                disabled={savingTrip}
                className="flex-1 py-3.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Bookmark className="w-4 h-4" />
                <span>{savingTrip ? 'Saving Journey...' : 'Save & View Trip Details'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Weather Along Route Timeline */}
      {activeRoute?.weatherPoints && (
        <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs">
          <RouteWeatherTimeline weatherPoints={activeRoute.weatherPoints} />
        </div>
      )}
    </div>
  );
};

export default PlanTrip;
