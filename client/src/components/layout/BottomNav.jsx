import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, MapPin, LayoutDashboard, Bookmark, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav = () => {
  const { user } = useAuth();
  if (!user) return null;

  const tabs = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Plan', path: '/plan-trip', icon: MapPin },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Saved', path: '/favorites', icon: Bookmark },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 py-2 px-4 shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                  isActive ? 'text-sky-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px]">{tab.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
