import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AuthModal from './components/AuthModal';
import { supabase } from './utils/supabase';

// Lazy-loaded routes for code splitting
const Admin = lazy(() => import('./pages/Admin'));
const Signup = lazy(() => import('./pages/Signup'));
const Login = lazy(() => import('./pages/Login'));
const FindPassword = lazy(() => import('./pages/FindPassword'));

// Loading Fallback Component
const RouteLoadingFallback = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
    color: '#d4af37',
    fontSize: '1.1rem',
    fontWeight: '500'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(212, 175, 55, 0.2)',
        borderTopColor: '#d4af37',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem auto'
      }}></div>
      <span>페이지를 불러오는 중입니다...</span>
    </div>
  </div>
);

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

  const openAuth = useCallback((mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setIsAuthOpen(false);
  }, []);

  const handleLoginSuccess = useCallback((email) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    setIsAuthOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserEmail('');
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Suspense fallback={<RouteLoadingFallback />}>
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
        </Suspense>
        
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
