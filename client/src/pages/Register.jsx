import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check, X } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import WeatherParticles from '../motion/WeatherParticles';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Password strength calculations
  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const strengthScore = [hasLength, hasNumber, hasSpecial].filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      addToast('Password must be at least 8 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      addToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Form */}
      <div className="lg:col-span-6 flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16">
        <div className="max-w-md w-full mx-auto space-y-8">
          <BrandLogo />

          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-sm text-slate-600 mt-2">
              Start planning weather-aware travel with real-time intelligence.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Veera Sharma"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                />
                <User className="w-5 h-5 text-slate-600 absolute left-3.5 top-3.5" />
              </div>
            </div>

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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {/* Password strength visualizer */}
              {password.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`transition-all duration-300 rounded-full ${
                        strengthScore === 1
                          ? 'w-1/3 bg-rose-500'
                          : strengthScore === 2
                          ? 'w-2/3 bg-amber-500'
                          : 'w-full bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                    <span className={hasLength ? 'text-emerald-600 font-semibold' : ''}>8+ chars</span>
                    <span>•</span>
                    <span className={hasNumber ? 'text-emerald-600 font-semibold' : ''}>1+ number</span>
                    <span>•</span>
                    <span className={hasSpecial ? 'text-emerald-600 font-semibold' : ''}>1+ symbol</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 pt-4"
            >
              <span>{loading ? 'Registering...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-sky-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column Visual */}
      <div className="hidden lg:block lg:col-span-6 relative bg-gradient-to-br from-indigo-900 via-sky-800 to-sky-600 p-12 overflow-hidden text-white">
        <WeatherParticles condition="rain" density="low" />
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="text-right">
            <span className="text-xs font-mono uppercase bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
              Open-Meteo High Resolution
            </span>
          </div>

          <div className="space-y-4 max-w-md">
            <h3 className="text-4xl font-black leading-tight">
              Proactive travel protection for all terrains.
            </h3>
            <p className="text-sky-100 text-sm leading-relaxed">
              Plan your journeys with complete confidence. Microclimate sampling pinpoints weather transitions before you arrive.
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

export default Register;
