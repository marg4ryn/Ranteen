import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { MenuProvider } from './contexts/MenuContext';
import authApi from './services/AuthApi';

import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Sidebar from './components/Layout/Sidebar';
import LoginPage from './components/Auth/LoginPage';
import VerificationPending from './components/Auth/VerificationPending';
import Calendar from './components/Calendar/Calendar';
import DayView from './components/Calendar/DayView';
import AdminLogin from './components/Admin/AdminLogin';
import MenuManagement from './components/Admin/MenuManagement';
import DishManagement from './components/Admin/DishManagement';
import UserVerification from './components/Admin/UserVerification';
import CommentModeration from './components/Admin/CommentModeration';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const checkCurrentUser = async () => {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
      setIsAuthLoading(false);
    };

    checkCurrentUser();
  }, []); 

  const isAuthenticated = !!user;
  const isVerified = user && user.status === 'VERIFIED';
  const isAdmin = user && user.role === 'ADMINISTRATOR';

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
  };

    if (isAuthLoading) {
    return <div>Ładowanie aplikacji...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, isVerified, isAdmin, logout: handleLogout }}>
      <MenuProvider>
        <Router>
          <div className="app-container">
            <Header />
            <div className="main-content">
              <Sidebar />
              <div className="content-area">
                <Routes>
                  {/* --- TRASY PUBLICZNE --- */}
                  <Route path="/" element={<Calendar />} />
                  <Route path="/day/:date" element={<DayView />} />

                  {/* --- TRASY AUTENTYKACJI --- */}
                  <Route 
                    path="/login" 
                    element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} 
                  />
                  <Route 
                    path="/admin/login" 
                    element={!isAuthenticated ? <AdminLogin /> : <Navigate to="/admin/menu" />} 
                  />
                  <Route 
                    path="/verification-pending" 
                    element={isAuthenticated && !isVerified ? <VerificationPending /> : <Navigate to="/" />} 
                  />

                  {/* --- TRASY CHRONIONE DLA ADMINA --- */}
                  <Route 
                    path="/admin/menu" 
                    element={<MenuManagement />} 
                  />
                  <Route 
                    path="/admin/dishes" 
                    element={<DishManagement />} 
                  />
                  <Route 
                    path="/admin/users" 
                    element={<UserVerification />} 
                  />
                  <Route 
                    path="/admin/comments" 
                    element={<CommentModeration />} 
                  />

                  {/* Catch-all route dla nieistniejących stron */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
            <Footer />
          </div>
        </Router>
      </MenuProvider>
    </AuthContext.Provider>
  );
}

export default App;