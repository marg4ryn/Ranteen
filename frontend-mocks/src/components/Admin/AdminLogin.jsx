import React, { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { mockUsers } from '../../data/mockUsers';
import './AdminLogin.css';

const AdminLogin = () => {
  const { setUser } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate login API call
    setTimeout(() => {
      // Find admin user
      const adminUser = mockUsers.find(
        user => user.role === 'ADMINISTRATOR' && user.username === username
      );
      
      if (adminUser && password === 'admin') { // Simple mock check
        setUser(adminUser);
      } else {
        setError('Nieprawidłowa nazwa użytkownika lub hasło');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Panel administratora</h2>
        <p>Zaloguj się, aby zarządzać aplikacją</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Nazwa użytkownika</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="admin-login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
        
        <div className="back-to-main">
          <a href="/">Powrót do strony głównej</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;