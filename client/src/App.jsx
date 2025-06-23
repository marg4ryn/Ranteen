import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

import Spinner from './components/Layout/Spinner';
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
import { Analytics } from './components/Analytics';

import './App.css';

function App() {
  const { isAuthenticated, isVerified, isAdmin, loading } = useContext(AuthContext);

  if (loading) {
    return <Spinner />;
  }

  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="main-content">
          <Sidebar />
          <div className="content-area">
            <Routes>
              {/* Tutaj bez zmian */}
              {/* --- TRASY PUBLICZNE --- */}
              <Route path="/" element={<Calendar />} />
              <Route path="/day/:date" element={<DayView />} />

              {/* --- TRASY AUTENTYKACJI --- */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/verification-pending" 
                element={isAuthenticated && !isVerified ? <VerificationPending /> : <Navigate to="/" />} 
              />

              {/* --- TRASY CHRONIONE DLA ADMINA --- */}
              {/* Tutaj możesz dodać dodatkową logikę sprawdzającą `isAdmin` i `isVerified` */}
              <Route path="/admin/menu" element={isAdmin ? <MenuManagement /> : <Navigate to="/" />} />
              <Route path="/admin/dishes" element={isAdmin ? <DishManagement /> : <Navigate to="/" />} />
              <Route path="/admin/users" element={isAdmin ? <UserVerification /> : <Navigate to="/" />} />
              <Route path="/admin/comments" element={isAdmin ? <CommentModeration /> : <Navigate to="/" />} />
              <Route path="/admin/analytics" element={isAdmin ? <Analytics /> : <Navigate to="/" />} />

              {/* Catch-all route dla nieistniejących stron */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;