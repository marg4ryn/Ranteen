import React, { createContext, useState } from 'react';

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  isVerified: false,
  isAdmin: false,
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const isAuthenticated = !!user;
  const isVerified = user?.isApproved ?? false;
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuthenticated, isVerified, isAdmin, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
