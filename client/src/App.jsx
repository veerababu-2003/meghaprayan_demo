import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BottomNav from './components/layout/BottomNav';
import VoiceAssistant from './components/voice/VoiceAssistant';
import { useAuth } from './context/AuthContext';

// Lazy-loaded pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PlanTrip = lazy(() => import('./pages/PlanTrip'));
const TripDetails = lazy(() => import('./pages/TripDetails'));
const LiveTrip = lazy(() => import('./pages/LiveTrip'));
const Explore = lazy(() => import('./pages/Explore'));
const History = lazy(() => import('./pages/History'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Features = lazy(() => import('./pages/Features'));
const About = lazy(() => import('./pages/About'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const App = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password'].some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-sky-500 selection:text-white">
      {!isAuthPage && <Navbar />}

      <main className="flex-grow">
        <Suspense
          fallback={
            <div className="min-h-[70vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
            </div>
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />

            {/* Authenticated Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plan-trip"
              element={
                <ProtectedRoute>
                  <PlanTrip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trip/:id"
              element={
                <ProtectedRoute>
                  <TripDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live-trip/:id"
              element={
                <ProtectedRoute>
                  <LiveTrip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {!isAuthPage && <Footer />}
      <BottomNav />
      <VoiceAssistant />
    </div>
  );
};

export default App;
