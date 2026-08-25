import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, LogOut, UserPlus, Menu, X } from 'lucide-react';

function Header({ openAuth, isLoggedIn, userEmail, handleLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        {/* Logo */}
        <Link to="/" style={logoStyle} onClick={() => setIsMobileMenuOpen(false)}>
          <img 
            src="/geummakchang_logo.png" 
            alt="금막창 로고" 
            style={{ height: '38px', objectFit: 'contain', display: 'block' }} 
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={navStyle} className="desktop-nav">
          <button style={navLinkStyle} onClick={() => scrollToSection('brand-story')}>브랜드 스토리</button>
          <button style={navLinkStyle} onClick={() => scrollToSection('menu-showcase')}>시그니처 메뉴</button>
          <button style={navLinkStyle} onClick={() => scrollToSection('store-info')}>매장 안내</button>
          <button style={navLinkStyle} onClick={() => scrollToSection('franchise-inquiry')}>가맹 문의</button>
        </nav>

        {/* Desktop Action Buttons */}
        <div style={actionsStyle} className="desktop-actions">
          <Link to="/admin" className="btn-outline-gold" style={adminBtnStyle}>
            <Settings size={16} />
            <span>관리자 모드</span>
          </Link>

          <span style={dividerStyle}></span>

          {isLoggedIn ? (
            <div style={userSectionStyle}>
              <span style={userEmailStyle}>{userEmail.split('@')[0]}님</span>
              <button onClick={handleLogout} className="btn-dark" style={authBtnStyle}>
                <LogOut size={15} />
                <span>로그아웃</span>
              </button>
            </div>
          ) : (
            <div style={authSectionStyle}>
              <Link to="/login" style={loginBtnStyle}>
                <span>로그인</span>
              </Link>
              <Link to="/signup" className="btn-gold" style={authBtnLinkStyle}>
                <UserPlus size={15} />
                <span>회원가입</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          style={mobileToggleBtnStyle}
          className="mobile-toggle-btn"
          aria-label="메뉴 열기/닫기"
        >
          {isMobileMenuOpen ? <X size={26} color="var(--primary-gold-hover)" /> : <Menu size={26} color="var(--text-dark)" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div style={mobileDrawerStyle} className="animate-fade-in">
          <nav style={mobileNavListStyle}>
            <button style={mobileNavLinkStyle} onClick={() => scrollToSection('brand-story')}>
              <span>브랜드 스토리</span>
            </button>
            <button style={mobileNavLinkStyle} onClick={() => scrollToSection('menu-showcase')}>
              <span>시그니처 메뉴</span>
            </button>
            <button style={mobileNavLinkStyle} onClick={() => scrollToSection('store-info')}>
              <span>매장 안내</span>
            </button>
            <button style={mobileNavLinkStyle} onClick={() => scrollToSection('franchise-inquiry')}>
              <span>가맹창업 문의</span>
            </button>
          </nav>

          <div style={{ padding: '1rem 0 0.5rem 0', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="btn-outline-gold" style={{ width: '100%', justifyContent: 'center' }}>
              <Settings size={16} />
              <span>관리자 모드</span>
            </Link>

            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-dark)' }}>{userEmail}</span>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="btn-dark" style={{ padding: '0.5rem 1rem' }}>
                  <LogOut size={15} />
                  <span>로그아웃</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-dark" style={{ flex: 1, justifyContent: 'center' }}>
                  <span>로그인</span>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="btn-gold" style={{ flex: 1, justifyContent: 'center' }}>
                  <UserPlus size={15} />
                  <span>회원가입</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

const headerStyle = {
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backgroundColor: 'rgba(253, 251, 247, 0.85)',
  backdropFilter: 'blur(8px)',
  borderBottom: '1px solid var(--border-color)',
  width: '100%',
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '1rem 2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const logoTextStyle = {
  fontSize: '1.4rem',
  fontWeight: '900',
  color: 'var(--text-dark)',
  letterSpacing: '0.1rem',
};

const navStyle = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
  whiteSpace: 'nowrap'
};

const navLinkStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1rem',
  fontWeight: '500',
  color: 'var(--text-dark)',
  cursor: 'pointer',
  padding: '0.5rem 0',
  position: 'relative',
  transition: 'var(--transition-smooth)',
  outline: 'none',
  whiteSpace: 'nowrap'
};

const actionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
  whiteSpace: 'nowrap'
};

const adminBtnStyle = {
  fontSize: '0.85rem',
  padding: '0.5rem 0.8rem',
  borderRadius: '6px',
};

const dividerStyle = {
  width: '1px',
  height: '20px',
  backgroundColor: 'var(--border-color)',
};

const userSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
};

const userEmailStyle = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: 'var(--text-dark)',
};

const authSectionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
};

const loginBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '0.9rem',
  fontWeight: '600',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '0.5rem 0.8rem',
  transition: 'var(--transition-smooth)',
  ':hover': {
    color: 'var(--text-dark)',
  }
};

const authBtnStyle = {
  fontSize: '0.85rem',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
};

const authBtnLinkStyle = {
  ...authBtnStyle,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  textDecoration: 'none',
};

const mobileToggleBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0.4rem',
  display: 'none',
  alignItems: 'center',
  justifyContent: 'center',
};

const mobileDrawerStyle = {
  backgroundColor: 'var(--bg-primary)',
  borderTop: '1px solid var(--border-color)',
  borderBottom: '1px solid var(--border-color)',
  padding: '1.2rem 1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  boxShadow: 'var(--shadow-md)',
};

const mobileNavListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const mobileNavLinkStyle = {
  background: 'none',
  border: 'none',
  textAlign: 'left',
  padding: '0.8rem 0.5rem',
  fontSize: '1.05rem',
  fontWeight: '600',
  color: 'var(--text-dark)',
  cursor: 'pointer',
  borderRadius: '6px',
  transition: 'var(--transition-smooth)',
};

export default Header;
