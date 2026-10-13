import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Clock, Trash2, ArrowRight, Play, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const History = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTrips = async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/trips?page=${currentPage}&limit=6`);
      if (res.data.success) {
        setTrips(res.data.trips);
        setTotalPages(res.data.pages || 1);
        setPage(res.data.page || 1);
      }
    } catch (e) {
      addToast('Error loading trips', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(1);
  }, []);

  const handleDelete = async (tripId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip record?')) return;

    try {
      await api.delete(`/trips/${tripId}`);
      addToast('Trip removed', 'info');
      fetchTrips(page);
    } catch (err) {
      addToast('Error removing trip', 'error');
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
            Journey Logs
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Trip History & Routes
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Access past routes, check safety scores, or re-run live journeys.
          </p>
        </div>

        <Link
          to="/plan-trip"
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          Plan New Journey
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-600 animate-pulse">
          Loading logged journeys...
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <Compass className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No journeys recorded yet</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            Every route calculated with weather points can be saved and revisited here.
          </p>
          <Link
            to="/plan-trip"
            className="inline-block mt-2 px-6 py-3 bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Plan Your First Journey
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => {
              const activeRoute = trip.routes && trip.routes[trip.selectedRouteIndex || 0];

              return (
                <div
                  key={trip._id}
                  onClick={() => navigate(`/trip/${trip._id}`)}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                        {trip.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          trip.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-1">
                      <div className="truncate">From: <strong className="text-slate-800">{trip.origin?.name}</strong></div>
                      <div className="truncate">To: <strong className="text-slate-800">{trip.destination?.name}</strong></div>
                    </div>
                  </div>

                  {activeRoute && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-600">{activeRoute.distanceKm} km</span>
                      <span className="font-bold text-sky-600">
                        Score: {activeRoute.dijkstraScore}/100
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/trip/${trip._id}`);
                      }}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
                    >
                      <span>View Route Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(trip._id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchTrips(i + 1)}
                  className={`w-9 h-9 rounded-xl font-bold text-xs transition-colors ${
                    page === i + 1
                      ? 'bg-sky-500 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;
