import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation, Compass, AlertTriangle, Square, Shield, Radio, Wind, Droplets } from 'lucide-react';
import InteractiveMap from '../components/map/InteractiveMap';
import WeatherCard from '../components/weather/WeatherCard';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';

export const LiveTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { addToast } = useToast();

  const [trip, setTrip] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [liveWeather, setLiveWeather] = useState(null);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [distanceRemaining, setDistanceRemaining] = useState(null);
  const [etaMinutes, setEtaMinutes] = useState(null);
  const [trackingActive, setTrackingActive] = useState(true);

  // Load trip information
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get(`/trips/${id}`);
        if (res.data.success) {
          setTrip(res.data.trip);
          const activeRoute = res.data.trip.routes[res.data.trip.selectedRouteIndex || 0];
          setDistanceRemaining(activeRoute?.distanceKm || 0);
          setEtaMinutes(activeRoute?.durationMinutes || 0);

          // Default initial location to trip origin
          setLiveLocation({
            lat: res.data.trip.origin.lat,
            lng: res.data.trip.origin.lng,
            speedKmh: 0
          });
        }
      } catch (e) {
        addToast('Error loading live trip session', 'error');
      }
    };

    fetchTrip();
  }, [id]);

  // Join Socket room & listen for broadcast telemetry
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join_trip', { tripId: id });

    socket.on('location_broadcast', (data) => {
      setLiveLocation({ lat: data.lat, lng: data.lng, speedKmh: data.speedKmh });
      setSpeedKmh(data.speedKmh);
      if (data.distanceRemainingKm !== undefined) setDistanceRemaining(data.distanceRemainingKm);
      if (data.etaMinutes !== undefined) setEtaMinutes(data.etaMinutes);
    });

    socket.on('live_weather_update', (data) => {
      if (data.weather) {
        setLiveWeather(data.weather);
      }
    });

    return () => {
      socket.emit('leave_trip', { tripId: id });
      socket.off('location_broadcast');
      socket.off('live_weather_update');
    };
  }, [socket, id]);

  // Browser Geolocation simulation / watcher
  useEffect(() => {
    if (!trackingActive || !trip) return;

    let watchId;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const speed = pos.coords.speed ? pos.coords.speed * 3.6 : 48; // km/h fallback

          setLiveLocation({ lat, lng, speedKmh: speed });
          setSpeedKmh(speed);

          // Emit to socket server
          if (socket) {
            socket.emit('update_location', {
              tripId: id,
              lat,
              lng,
              speedKmh: speed,
              distanceRemainingKm: Math.max(0, (distanceRemaining || 10) - 0.2),
              etaMinutes: Math.max(0, (etaMinutes || 20) - 1)
            });
          }
        },
        (err) => {
          console.warn('[Geolocation note]', err.message);
          // Non-blocking fallback simulation along route
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [trackingActive, trip, socket, id]);

  const handleEndTrip = async () => {
    try {
      await api.post(`/trips/${id}/end`);
      setTrackingActive(false);
      addToast('Trip finished successfully and logged to stats!', 'success');
      navigate(`/trip/${id}`);
    } catch (err) {
      addToast('Error ending trip', 'error');
    }
  };

  if (!trip) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Initializing live session...</h2>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. Header with Pulse Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
              {isConnected ? '🟢 Live Socket Active' : '🟡 Reconnecting...'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Live Journey: {trip.title}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Real-time geolocation telemetry & atmospheric radar updates.
          </p>
        </div>

        <button
          onClick={handleEndTrip}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <Square className="w-4 h-4 fill-white" />
          <span>Complete Journey</span>
        </button>
      </div>

      {/* 2. Live Telemetry HUD Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="text-center sm:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Current Speed
          </span>
          <span className="text-2xl font-black text-sky-400">
            {Math.round(speedKmh)} <span className="text-xs font-semibold text-white">km/h</span>
          </span>
        </div>

        <div className="text-center sm:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Remaining Distance
          </span>
          <span className="text-2xl font-black text-white">
            {distanceRemaining !== null ? `${Math.round(distanceRemaining)} km` : 'Calculating'}
          </span>
        </div>

        <div className="text-center sm:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Est. Arrival ETA
          </span>
          <span className="text-2xl font-black text-emerald-400">
            {etaMinutes !== null ? `${etaMinutes} mins` : 'Estimating'}
          </span>
        </div>

        <div className="text-center sm:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Weather Radar
          </span>
          <span className="text-sm font-bold text-amber-300 block mt-1">
            {liveWeather ? liveWeather.conditionText : 'Stable'}
          </span>
        </div>
      </div>

      {/* 3. Real-time Map & Live Weather Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <InteractiveMap
            routes={trip.routes}
            selectedRouteIndex={trip.selectedRouteIndex || 0}
            origin={trip.origin}
            destination={trip.destination}
            liveLocation={liveLocation}
            className="h-[460px] w-full rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          {liveWeather ? (
            <WeatherCard weather={liveWeather} title="Current Location Radar" />
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Atmospheric Monitor
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Listening for real-time weather alerts along the path. As your GPS moves through microclimates, new weather updates are retrieved.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider block">Privacy Note:</span>
            <p>
              Your high-frequency live GPS telemetry is streamed only to your active journey room via WebSockets and is not stored in your permanent profile unless location history is enabled in Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrip;
