import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { ST_TOKEN_KEY, ST_USER_KEY } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem(ST_TOKEN_KEY);
    const savedUser = localStorage.getItem(ST_USER_KEY);
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // Listen for unauth events from api interceptor
  useEffect(() => {
    const handleUnauth = () => {
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    };
    window.addEventListener('auth-unauthorized', handleUnauth);
    return () => window.removeEventListener('auth-unauthorized', handleUnauth);
  }, []);

  // Apply dark mode on user change
  useEffect(() => {
    if (user?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user]);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    const { token, user: userData } = data;
    localStorage.setItem(ST_TOKEN_KEY, token);
    localStorage.setItem(ST_USER_KEY, JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    const { token, user: userData } = data;
    localStorage.setItem(ST_TOKEN_KEY, token);
    localStorage.setItem(ST_USER_KEY, JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const googleLogin = async (idToken) => {
    const { data } = await api.post('/api/auth/google', { idToken });
    const { token, user: userData } = data;
    localStorage.setItem(ST_TOKEN_KEY, token);
    localStorage.setItem(ST_USER_KEY, JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem(ST_TOKEN_KEY);
    localStorage.removeItem(ST_USER_KEY);
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updatePreferences = async (prefs) => {
    const { data } = await api.put('/api/auth/preferences', prefs);
    const updatedUser = data.user;
    localStorage.setItem(ST_USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const forgotPassword = async (email) => {
    const { data } = await api.post('/api/auth/forgotpassword', { email });
    return data;
  };

  const resetPassword = async (token, password) => {
    const { data } = await api.put(`/api/auth/resetpassword/${token}`, { password });
    return data;
  };

  const updatePassword = async (currentPassword, newPassword) => {
    const { data } = await api.put('/api/auth/updatepassword', { currentPassword, newPassword });
    // After changing password, update token so user remains logged in
    const { token } = data;
    localStorage.setItem(ST_TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, googleLogin, logout, updatePreferences,
      forgotPassword, resetPassword, updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
