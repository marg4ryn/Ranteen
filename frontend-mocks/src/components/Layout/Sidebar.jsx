// Sidebar.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { MenuContext } from '../../contexts/MenuContext';
import './Sidebar.css';

const Sidebar = () => {
  const { isAuthenticated, isVerified, isAdmin } = useContext(AuthContext);
  const { menus } = useContext(MenuContext);
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // If not authenticated, don't show sidebar
  if (!isAuthenticated) {
    return null;
  }
  
  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Close sidebar after navigation on mobile
  const handleNavigation = (path) => {
    navigate(path);
    setIsExpanded(false);
  };
  
  // Get today's date
  const today = new Date();
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Get upcoming menus (today and future)
  const upcomingMenus = menus
    .filter(menu => {
      const menuDate = new Date(menu.date);
      return menuDate >= new Date(today.setHours(0, 0, 0, 0));
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5); // Show only next 5 menus
  
  // Format date for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Dzisiaj';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Jutro';
    } else {
      return date.toLocaleDateString('pl-PL', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };
  
  return (
    <>
      <button 
        className={`sidebar-toggle ${isExpanded ? 'expanded' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <span className="toggle-icon"></span>
        <span className="toggle-text">Menu</span>
      </button>
      
      <div className={`sidebar ${isExpanded ? 'expanded' : ''}`}>
        {isAdmin ? (
          <div className="admin-sidebar">
            <h3>Panel administratora</h3>
            <ul className="sidebar-menu">
              <li>
                <a onClick={() => handleNavigation('/admin/menu')}>Zarządzanie menu</a>
              </li>
              <li>
                <a onClick={() => handleNavigation('/admin/users')}>Weryfikacja użytkowników</a>
              </li>
              <li>
                <a onClick={() => handleNavigation('/admin/comments')}>Moderacja komentarzy</a>
              </li>
            </ul>
          </div>
        ) : (
          <div className="student-sidebar">
            {isVerified ? (
              <>
                <div className="quick-links">
                  <h3>Szybki dostęp</h3>
                  <ul className="sidebar-menu">
                    <li>
                      <a onClick={() => handleNavigation('/')}>Kalendarz</a>
                    </li>
                    <li>
                      <a onClick={() => handleNavigation(`/day/${formatDate(new Date())}`)}>
                        Dzisiejsze danie
                      </a>
                    </li>
                  </ul>
                </div>
                
                <div className="upcoming-menus">
                  <h3>Nadchodzące menu</h3>
                  {upcomingMenus.length > 0 ? (
                    <ul className="sidebar-menu">
                      {upcomingMenus.map(menu => (
                        <li key={menu.id}>
                          <a onClick={() => handleNavigation(`/day/${menu.date}`)}>
                            {formatDateForDisplay(menu.date)}
                            <span className="dish-count">
                              {menu.dishes.length} {menu.dishes.length === 1 ? 'danie' : 
                                (menu.dishes.length < 5 ? 'dania' : 'dań')}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-upcoming">Brak zaplanowanych menu.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="verification-notice">
                <h3>Weryfikacja konta</h3>
                <p>Twoje konto oczekuje na weryfikację przez administratora.</p>
                <p>Po weryfikacji uzyskasz dostęp do pełnej funkcjonalności aplikacji.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;