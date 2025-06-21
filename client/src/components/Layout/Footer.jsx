import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-info">
          <p>&copy; {currentYear} Ranteen. Wszelkie prawa zastrzeżone.</p>
        </div>
        
        <div className="footer-links">
          <a href="#">Regulamin</a>
          <a href="#">Polityka prywatności</a>
          <a href="#">Kontakt</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;