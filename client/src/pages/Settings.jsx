import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, ShieldAlert, Key, Bell, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Preferences
  const [distanceUnit, setDistanceUnit] = useState(user?.preferences?.distanceUnit || 'km');
  const [tempUnit, setTempUnit] = useState(user?.preferences?.tempUnit || 'c');
  const [notifications, setNotifications] = useState(user?.preferences?.notifications !== false);

  // Change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSavePreferences = async () => {
    try {
      const res = await api.put('/users/profile', {
        preferences: { distanceUnit, tempUnit, notifications }
      });
      if (res.data.success) {
        updateUser(res.data.user);
        addToast('Preferences saved!', 'success');
      }
    } catch (e) {
      addToast('Error saving preferences', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      addToast('New password must be at least 8 characters long', 'error');
      return;
    }
    setChangingPass(true);
    try {
      const res = await api.put('/users/change-password', { currentPassword, newPassword });
      addToast(res.data.message || 'Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Error changing password', 'error');
    } finally {
      setChangingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/users/account');
      addToast('Account and associated trips deleted permanently', 'info');
      logout();
      navigate('/');
    } catch (err) {
      addToast('Failed to delete account', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
          Configuration
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
          Platform Settings
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage meteorological units, privacy, security, and account status.
        </p>
      </div>

      {/* 1. Unit & Notification Preferences */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
          Units & Alerts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Distance Format
            </label>
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
            >
              <option value="km">Kilometers (km)</option>
              <option value="mi">Miles (mi)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Temperature Scale
            </label>
            <select
              value={tempUnit}
              onChange={(e) => setTempUnit(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
            >
              <option value="c">Celsius (°C)</option>
              <option value="f">Fahrenheit (°F)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-sm font-bold text-slate-800 block">Severe Weather Notifications</span>
            <span className="text-xs text-slate-600">Receive alerts if rainfall or thunderstorms occur on saved routes.</span>
          </div>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
          />
        </div>

        <button
          onClick={handleSavePreferences}
          className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
        >
          Save Preferences
        </button>
      </div>

      {/* 2. Security / Change Password */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center space-x-2">
          <Key className="w-5 h-5 text-sky-500" />
          <span>Change Password</span>
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              placeholder="Minimum 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={changingPass}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            {changingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* 3. Danger Zone: Delete Account */}
      <div className="bg-rose-50/50 rounded-3xl p-7 border border-rose-200 space-y-4">
        <div className="flex items-center space-x-2 text-rose-700 font-bold text-lg">
          <Trash2 className="w-5 h-5" />
          <span>Danger Zone: Permanent Account Deletion</span>
        </div>
        <p className="text-xs text-rose-800/80 leading-relaxed">
          Deleting your account will permanently remove all your saved routes, trip records, favorites, and computed telemetry stats. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-7 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you completely sure you want to permanently erase your MeghaPrayan account?
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
