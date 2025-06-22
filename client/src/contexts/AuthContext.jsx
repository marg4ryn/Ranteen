import React, { createContext, useState, useEffect } from 'react';
import authApi from '../services/AuthApi';

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  isVerified: false,
  isAdmin: false,
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const checkCurrentUser = async () => {
    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  checkCurrentUser();
}, []);


  const isAuthenticated = !!user;
  const isVerified = user?.status === 'VERIFIED' || user?.isApproved === true;
  const isAdmin = user?.role === 'ADMINISTRATOR' || user?.role === 'admin';

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuthenticated, isVerified, isAdmin, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
