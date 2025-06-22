import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { MenuProvider } from './contexts/MenuContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <MenuProvider>
        <App />
      </MenuProvider>
    </AuthProvider>
  </React.StrictMode>
);