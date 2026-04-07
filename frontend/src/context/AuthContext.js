import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sb_token');
    const stored = localStorage.getItem('sb_user');
    if (token && stored) {
      setUser(JSON.parse(stored));
      authApi.me().then(r => { setUser(r.data); localStorage.setItem('sb_user', JSON.stringify(r.data)); }).catch(() => logout()).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const login = async (email, password) => {
    const r = await authApi.login({ email, password });
    localStorage.setItem('sb_token', r.data.token);
    localStorage.setItem('sb_user', JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = () => {
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
    setUser(null);
  };

  const updateUser = (u) => { setUser(u); localStorage.setItem('sb_user', JSON.stringify(u)); };

  return <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
