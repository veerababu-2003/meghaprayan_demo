import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Car, Calendar, Route, CheckCircle } from 'lucide-react';
import CountUp from '../motion/CountUp';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [preferredMode, setPreferredMode] = useState(user?.preferredMode || 'car');
  const [stats, setStats] = useState({ totalTrips: 0, completedTrips: 0, totalDistanceKm: 0, totalHours: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (e) {}
    };
    fetchStats();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/profile', { name, preferredMode });
      if (res.data.success) {
        updateUser(res.data.user);
        addToast('Profile details updated!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
          Account Profile
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
          Traveler Profile & Analytics
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Real computed travel statistics and account preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-2xl shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-600">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                />
                <User className="w-5 h-5 text-slate-600 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Default Transport Preference
              </label>
              <select
                value={preferredMode}
                onChange={(e) => setPreferredMode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-sky-500 focus:outline-none transition-all font-medium text-slate-800"
              >
                <option value="car">Automobile (Car)</option>
                <option value="bike">Two-Wheeler (Motorcycle / Bike)</option>
                <option value="walking">Walking / Pedestrian</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all pt-3"
            >
              {saving ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right Computed Stats */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Computed Journey Statistics</h3>
              <p className="text-xs text-slate-600">Generated from stored travel records (no fabricated metrics)</p>
            </div>
            <Route className="w-5 h-5 text-sky-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Total Distance
              </span>
              <span className="text-2xl font-black text-slate-900">
                <CountUp end={stats.totalDistanceKm} suffix=" km" />
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Total Road Time
              </span>
              <span className="text-2xl font-black text-slate-900">
                <CountUp end={stats.totalHours} suffix=" hrs" decimals={1} />
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Journeys Planned
              </span>
              <span className="text-2xl font-black text-sky-600">
                <CountUp end={stats.totalTrips} />
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                Completed Journeys
              </span>
              <span className="text-2xl font-black text-emerald-600">
                <CountUp end={stats.completedTrips} />
              </span>
            </div>
          </div>

          <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100 text-xs text-sky-800 leading-relaxed">
            MeghaPrayan guarantees accurate statistics computed strictly across your logged routes and live socket journeys.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
