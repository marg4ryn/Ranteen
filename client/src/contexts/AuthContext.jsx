import { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  isVerified: false,
  isAdmin: false
});