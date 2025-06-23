import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const closeMenu = () => {
    setMenuOpen(false);
  };
  
  return (
    <header className="app-header">
      <div className="logo">
        <h1><Link to="/" onClick={closeMenu}>Ranteen</Link></h1>
      </div>
      
      <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
        <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
      </button>
      
      <div className={`nav-container ${menuOpen ? 'open' : ''}`}>
        <nav className="main-nav" style={{ display: menuOpen ? 'flex' : 'none' }}>
          {!isAdmin && (
            <ul>
              <li>
                <Link to={`/`} onClick={closeMenu}>
                  Kalendarz
                </Link>
                <Link to={`/day/${new Date().toISOString().split('T')[0]}`} onClick={closeMenu}>
                  Dzisiejsze danie
                </Link>
              </li>
            </ul>
          )}
          {isAdmin && isAuthenticated &&(
            <ul>
              <li>
                <Link to={`/`} onClick={closeMenu}>
                  Podgląd stołówki
                </Link>
                <Link to={`/admin/menu`} onClick={closeMenu}>
                  Zarządzanie menu
                </Link>
                <Link to={`/admin/dishes`} onClick={closeMenu}>
                  Zarządzanie daniami
                </Link>
                <Link to={`/admin/users`} onClick={closeMenu}>
                  Weryfikacja użytkowników
                </Link>
                <Link to={`/admin/comments`} onClick={closeMenu}>
                  Moderacja komentarzy
                </Link>
              </li>
            </ul>
          )}
        </nav>
        
        <div className="user-section">
          {isAuthenticated ? (
            <div className="user-info">
              {user.profilePictureUrl && (
                <img src={user.profilePictureUrl} alt={user.name} className="user-avatar" />
              )}
              <span className="user-name">{user.name}</span>
              <button onClick={logout} className="logout-btn">Wyloguj</button>
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