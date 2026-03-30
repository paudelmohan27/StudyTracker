import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('st_token');
    const savedUser = localStorage.getItem('st_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
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
    localStorage.setItem('st_token', token);
    localStorage.setItem('st_user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    const { token, user: userData } = data;
    localStorage.setItem('st_token', token);
    localStorage.setItem('st_user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('st_token');
    localStorage.removeItem('st_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updatePreferences = async (prefs) => {
    const { data } = await api.put('/api/auth/preferences', prefs);
    const updatedUser = data.user;
    localStorage.setItem('st_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
