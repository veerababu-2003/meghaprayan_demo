import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Compass, MapPin, Sparkles, User, LogOut, Bell } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(res => {
        if (res.data && res.data.unreadCount !== undefined) {
          setUnreadNotifications(res.data.unreadCount);
        }
      }).catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Plan Trip', path: '/plan-trip', auth: true },
    { name: 'Explore', path: '/explore' },
    { name: 'Features', path: '/features' },
    { name: 'About', path: '/about' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm py-3 border-b border-slate-100'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <BrandLogo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-7">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-sky-600 ${
                location.pathname === link.path ? 'text-sky-600 font-semibold' : 'text-slate-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="hidden md:flex items-center space-x-3.5">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/history"
                className="relative p-2 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-full transition-colors"
                title="Notifications & Trips"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                )}
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
              >
                <User className="w-4 h-4 text-sky-600" />
                <span>{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-sky-600 px-3 py-2 rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-100 px-5 pt-3 pb-6 space-y-3 shadow-xl"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-700 hover:text-sky-600"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2.5">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-slate-800 font-semibold"
                  >
                    <User className="w-4 h-4 text-sky-500" />
                    <span>Dashboard ({user.name})</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-2 text-left py-2 text-rose-600 font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-sky-500 text-white font-semibold"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
