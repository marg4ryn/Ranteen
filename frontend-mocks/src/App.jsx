import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { MenuContext } from './contexts/MenuContext';

// Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Sidebar from './components/Layout/Sidebar';
import LoginPage from './components/Auth/LoginPage';
import VerificationPending from './components/Auth/VerificationPending';
import Calendar from './components/Calendar/Calendar';
import DayView from './components/Calendar/DayView';
import AdminLogin from './components/Admin/AdminLogin';
import MenuManagement from './components/Admin/MenuManagement';
import UserVerification from './components/Admin/UserVerification';
import CommentModeration from './components/Admin/CommentModeration';

// Mock data
import { mockMenus } from './data/mockMenus';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState(mockMenus);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Check if user is verified
  const isVerified = user && user.status === 'VERIFIED';
  
  // Check if user is admin
  const isAdmin = user && user.role === 'ADMINISTRATOR';

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, isVerified, isAdmin }}>
      <MenuContext.Provider value={{ menus, setMenus, selectedDate, setSelectedDate }}>
        <Router>
          <div className="app-container">
            <Header />
            <div className="main-content">
              <Sidebar />
              <div className="content-area">
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
                  <Route path="/admin/login" element={!isAdmin ? <AdminLogin /> : <Navigate to="/admin/menu" />} />
                  
                  {/* Routes for authenticated but not verified users */}
                  <Route 
                    path="/verification-pending" 
                    element={isAuthenticated && !isVerified ? <VerificationPending /> : <Navigate to="/" />} 
                  />
                  
                  {/* Routes for verified users */}
                  <Route 
                    path="/" 
                    element={isAuthenticated ? (isVerified ? <Calendar /> : <Navigate to="/verification-pending" />) : <Navigate to="/login" />} 
                  />
                  <Route 
                    path="/day/:date" 
                    element={isAuthenticated ? (isVerified ? <DayView /> : <Navigate to="/verification-pending" />) : <Navigate to="/login" />} 
                  />
                  
                  {/* Admin routes */}
                  <Route 
                    path="/admin/menu" 
                    element={isAdmin ? <MenuManagement /> : <Navigate to="/admin/login" />} 
                  />
                  <Route 
                    path="/admin/users" 
                    element={isAdmin ? <UserVerification /> : <Navigate to="/admin/login" />} 
                  />
                  <Route 
                    path="/admin/comments" 
                    element={isAdmin ? <CommentModeration /> : <Navigate to="/admin/login" />} 
                  />
                </Routes>
              </div>
            </div>
            <Footer />
          </div>
        </Router>
      </MenuContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;