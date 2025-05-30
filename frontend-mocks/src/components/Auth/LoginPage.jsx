import React, { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { mockUsers } from '../../data/mockUsers';
import './LoginPage.css';

const LoginPage = () => {
  const { setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const studentUser = mockUsers.find(user => user.role === 'STUDENT');
      setUser(studentUser);
      setIsLoading(false);
    }, 1500);
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
          {isLoading ? 'Logowanie...' : 'Zaloguj się przez Google'}
        </button>
        
        <div className="admin-login-link">
          <a href="/admin/login">Logowanie dla administratorów</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;