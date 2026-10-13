import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2, ArrowRight, Bookmark, MapPin } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const Favorites = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites');
      if (res.data.success) {
        setFavorites(res.data.favorites);
      }
    } catch (e) {
      addToast('Error fetching favorites', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (favId) => {
    try {
      await api.delete(`/favorites/${favId}`);
      addToast('Removed from favorites', 'info');
      setFavorites(favorites.filter((f) => f._id !== favId));
    } catch (e) {
      addToast('Failed to remove favorite', 'error');
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
          Bookmarked Corridors
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
          Saved Favorites
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Quickly access frequently analyzed routes and preferred destinations.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-600 animate-pulse">
          Loading favorites...
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No favorites saved yet</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            Tap the heart icon on any calculated trip to save it here for fast re-access.
          </p>
          <Link
            to="/plan-trip"
            className="inline-block mt-2 px-6 py-3 bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Plan & Save a Journey
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <div
              key={fav._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">
                    {fav.type}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{fav.title}</h3>
                </div>
                <button
                  onClick={() => handleRemove(fav._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {fav.data?.tripId && (
                <button
                  onClick={() => navigate(`/trip/${fav.data.tripId}`)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-sky-500 hover:text-white text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <span>Open Saved Trip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
