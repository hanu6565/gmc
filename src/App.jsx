import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import AuthModal from './components/AuthModal';

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
  };

  const handleLoginSuccess = (email) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                openAuth={openAuth} 
                isLoggedIn={isLoggedIn} 
                userEmail={userEmail} 
                handleLogout={handleLogout} 
              />
            } 
          />
          <Route 
            path="/admin" 
            element={
              <Admin 
                isLoggedIn={isLoggedIn}
                userEmail={userEmail}
                openAuth={openAuth}
              />
            } 
          />
        </Routes>
        
        {isAuthOpen && (
          <AuthModal 
            mode={authMode} 
            setMode={setAuthMode} 
            onClose={closeAuth} 
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
