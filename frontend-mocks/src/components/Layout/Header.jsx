// Header.jsx
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, setUser, isAuthenticated, isAdmin } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setMenuOpen(false);
  };
  
  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  // Close menu after navigation
  const closeMenu = () => {
    setMenuOpen(false);
  };
  
  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/" onClick={closeMenu}>
          <h1>Ranteen</h1>
        </Link>
      </div>
      
      <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
        <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
      </button>
      
      <div className={`nav-container ${menuOpen ? 'open' : ''}`}>
        <nav className="main-nav">
          {isAuthenticated && !isAdmin && (
            <ul>
              <li>
                <Link to="/" onClick={closeMenu}>Kalendarz</Link>
              </li>
              <li>
                <Link to={`/day/${new Date().toISOString().split('T')[0]}`} onClick={closeMenu}>
                  Dzisiejsze danie
                </Link>
              </li>
            </ul>
          )}
          
          {isAdmin && (
            <ul>
              <li>
                <Link to="/admin/menu" onClick={closeMenu}>Zarządzanie menu</Link>
              </li>
              <li>
                <Link to="/admin/users" onClick={closeMenu}>Weryfikacja użytkowników</Link>
              </li>
              <li>
                <Link to="/admin/comments" onClick={closeMenu}>Moderacja komentarzy</Link>
              </li>
            </ul>
          )}
        </nav>
        
        <div className="user-section">
          {isAuthenticated ? (
            <div className="user-info">
              {user.avatar && (
                <img src={user.avatar} alt={user.name} className="user-avatar" />
              )}
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="logout-btn">Wyloguj</button>
            </div>
          ) : (
            <Link to="/login" className="login-btn" onClick={closeMenu}>Zaloguj się</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;