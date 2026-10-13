import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (res.data.devResetUrl) {
        setDevResetUrl(res.data.devResetUrl);
      }
      addToast(res.data.message || 'Reset link issued', 'info');
    } catch (err) {
      addToast(err.response?.data?.message || 'Error requesting password reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 space-y-6">
        <BrandLogo />

        <div>
          <h2 className="text-2xl font-black text-slate-900">Forgot Password</h2>
          <p className="text-xs text-slate-600 mt-1">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-sky-50 text-sky-800 text-xs rounded-2xl border border-sky-100 leading-relaxed">
              If an account with that email exists, reset instructions have been issued.
            </div>

            {devResetUrl && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2">
                <span className="font-bold text-amber-800 uppercase tracking-wider block">Development Reset Link:</span>
                <a href={devResetUrl} className="text-sky-600 underline break-all block">
                  {devResetUrl}
                </a>
              </div>
            )}

            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-xs font-bold text-sky-600 hover:text-sky-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to sign in</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                />
                <Mail className="w-5 h-5 text-slate-600 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Processing...' : 'Send Reset Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-bold text-slate-600 hover:text-slate-900">
                Cancel and return to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
