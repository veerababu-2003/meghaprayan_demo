import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mp_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('mp_access_token'));
  const [loading, setLoading] = useState(true);

  // Sync state and check session validity on boot
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('mp_access_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('mp_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid');
          logout();
        }
      }
      setLoading(false);
    };

    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth_logout', handleLogoutEvent);
    initAuth();

    return () => window.removeEventListener('auth_logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('mp_access_token', res.data.token);
      localStorage.setItem('mp_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('mp_access_token', res.data.token);
      localStorage.setItem('mp_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network failures on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('mp_access_token');
      localStorage.removeItem('mp_user');
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('mp_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
