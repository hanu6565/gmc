import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, Home, Crown, Globe, Sliders } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', name: '대시보드', icon: LayoutDashboard },
    { id: 'customers', name: '고객관리 (CRM)', icon: Users },
    { id: 'analytics', name: '통계 / 리포트', icon: BarChart3 },
    { id: 'content', name: '홈페이지 콘텐츠 관리', icon: Globe },
    { id: 'popup', name: '팝업 관리', icon: Sliders },
  ];

  return (
    <aside style={sidebarStyle}>
      {/* Admin Title */}
      <div style={logoAreaStyle}>
        <Crown size={22} style={{ color: 'var(--primary-gold)' }} />
        <span style={logoTextStyle}>금막창 Admin</span>
      </div>

      {/* Tabs Menu List */}
      <nav style={menuListStyle}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...menuItemButtonStyle,
                backgroundColor: isActive ? 'var(--primary-gold-light)' : 'transparent',
                color: isActive ? 'var(--primary-gold-hover)' : 'var(--text-dark)',
                fontWeight: isActive ? '700' : '500',
              }}
            >
              <IconComponent size={18} style={{ color: isActive ? 'var(--primary-gold-hover)' : 'var(--text-muted)' }} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Home Button */}
      <div style={footerAreaStyle}>
        <Link to="/" style={homeLinkStyle} className="btn-dark">
          <Home size={16} />
          <span>홈페이지 이동</span>
        </Link>
      </div>
    </aside>
  );
}

const sidebarStyle = {
  width: '260px',
  backgroundColor: '#ffffff',
  borderRight: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  position: 'sticky',
  top: 0,
  padding: '2rem 1rem',
};

const logoAreaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0 0.75rem 2rem 0.75rem',
  borderBottom: '1px solid var(--border-color)',
  marginBottom: '2rem',
};

const logoTextStyle = {
  fontSize: '1.25rem',
  fontWeight: '800',
  color: 'var(--text-dark)',
  letterSpacing: '0.05rem',
};

const menuListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  flexGrow: 1,
};

const menuItemButtonStyle = {
  border: 'none',
  borderRadius: '8px',
  padding: '0.85rem 1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.85rem',
  cursor: 'pointer',
  fontSize: '0.95rem',
  textAlign: 'left',
  transition: 'var(--transition-smooth)',
  outline: 'none',
  width: '100%',
};

const footerAreaStyle = {
  paddingTop: '1.5rem',
  borderTop: '1px solid var(--border-color)',
};

const homeLinkStyle = {
  width: '100%',
  padding: '0.75rem',
  fontSize: '0.9rem',
  borderRadius: '8px',
};

export default Sidebar;
