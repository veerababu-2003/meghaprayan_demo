import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import WeatherParticles from '../motion/WeatherParticles';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back to MeghaPrayan!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Column: Form */}
      <div className="lg:col-span-6 flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16">
        <div className="max-w-md w-full mx-auto space-y-8">
          <BrandLogo />

          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-sm text-slate-600 mt-2">
              Access your personalized weather corridors and saved journeys.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link to="/forgot-password" tabIndex={-1} className="text-xs font-semibold text-sky-600 hover:text-sky-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-sky-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column: Visual Weather Atmosphere */}
      <div className="hidden lg:block lg:col-span-6 relative bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-900 p-12 overflow-hidden text-white">
        <WeatherParticles condition="cloud" density="medium" />
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="text-right">
            <span className="text-xs font-mono uppercase bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
              Live Gateway Active
            </span>
          </div>

          <div className="space-y-4 max-w-md">
            <h3 className="text-4xl font-black leading-tight">
              Real meteorological models for real journeys.
            </h3>
            <p className="text-sky-100 text-sm leading-relaxed">
              Every route plan calculates precipitation risk, road temperature, and crosswinds to deliver dynamic Dijkstra safety scores.
            </p>
          </div>

          <div className="text-xs text-sky-200">
            MeghaPrayan Navigation Platform © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
