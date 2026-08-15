import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Settings, LogOut, LogIn, UserPlus } from 'lucide-react';

function Header({ openAuth, isLoggedIn, userEmail, handleLogout }) {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        {/* Logo */}
        <Link to="/" style={logoStyle}>
          <img 
            src="/geummakchang_logo.png" 
            alt="금막창 로고" 
            style={{ height: '42px', objectFit: 'contain', display: 'block' }} 
          />
        </Link>

        {/* Navigation Links */}
        <nav style={navStyle}>
          <button style={navLinkStyle} onClick={() => scrollToSection('brand-story')}>브랜드 스토리</button>
          <button style={navLinkStyle} onClick={() => scrollToSection('signature-menu')}>시그니처 메뉴</button>
          <button style={navLinkStyle} onClick={() => scrollToSection('reservation')}>예약 & 문의</button>
        </nav>

        {/* Action Buttons */}
        <div style={actionsStyle}>
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
              <button onClick={() => openAuth('login')} style={loginBtnStyle}>
                <span>로그인</span>
              </button>
              <button onClick={() => openAuth('signup')} className="btn-gold" style={authBtnStyle}>
                <UserPlus size={15} />
                <span>회원가입</span>
              </button>
            </div>
          )}
        </div>
      </div>
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
  gap: '2rem',
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
  ':hover': {
    color: 'var(--primary-gold-hover)',
  }
};

const actionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
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

export default Header;
