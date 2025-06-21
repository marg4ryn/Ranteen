import React, { useState } from 'react';
import authApi from '../../services/AuthApi';
import './LoginPage.css';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    authApi.loginWithGoogle();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Witaj w Ranteen</h2>
        <p>Zaloguj się za pomocą konta Google, aby oceniać i komentować dania</p>
        
        <button 
          className="google-login-button" 
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Przekierowywanie...' : 'Zaloguj się przez Google'}
        </button>
        
        <div className="admin-login-link">
          <a href="/admin/login">Logowanie dla administratorów</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;