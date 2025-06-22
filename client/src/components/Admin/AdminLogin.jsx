import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../services/AuthApi';
import { AuthContext } from '../../contexts/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    authApi.loginAdmin(email, password)
    .then(user => {
      setUser(user);
       navigate(`/`);
    })
    .catch(err => {
      setError(err.message);
    })
    .finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Panel administratora</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <a href="/login">Powrót</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;