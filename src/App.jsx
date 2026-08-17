import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Signup from './pages/Signup';
import Login from './pages/Login';
import FindPassword from './pages/FindPassword';
import AuthModal from './components/AuthModal';
import { supabase } from './utils/supabase';

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Check current active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email);
      }
    });

    // Listen to changes in auth state (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email);
      } else {
        setIsLoggedIn(false);
        setUserEmail('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
          <Route 
            path="/signup" 
            element={
              <Signup />
            } 
          />
          <Route 
            path="/login" 
            element={
              <Login onLoginSuccess={handleLoginSuccess} />
            } 
          />
          <Route 
            path="/find-password" 
            element={
              <FindPassword />
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
