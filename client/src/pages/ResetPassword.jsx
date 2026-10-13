import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword });
      addToast(res.data.message || 'Password reset successful', 'success');
      navigate('/login');
    } catch (err) {
      addToast(err.response?.data?.message || 'Password reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 space-y-6">
        <BrandLogo />

        <div>
          <h2 className="text-2xl font-black text-slate-900">Reset Password</h2>
          <p className="text-xs text-slate-600 mt-1">
            Choose a strong new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
              />
              <Lock className="w-5 h-5 text-slate-600 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
