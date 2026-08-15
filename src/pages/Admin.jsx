import React, { useState } from 'react';
import Sidebar from '../components/admin/Sidebar';
import DashboardTab from '../components/admin/DashboardTab';
import CustomerTab from '../components/admin/CustomerTab';
import AnalyticsTab from '../components/admin/AnalyticsTab';
import ContentTab from '../components/admin/ContentTab';
import PopupTab from '../components/admin/PopupTab';
import { User, Bell, ChevronDown } from 'lucide-react';

function Admin({ isLoggedIn, userEmail, openAuth }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'customers':
        return <CustomerTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'content':
        return <ContentTab />;
      case 'popup':
        return <PopupTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div style={adminLayoutStyle}>
      {/* Sidebar Nav */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel Content Area */}
      <div style={mainPanelStyle}>
        {/* Top Header Bar */}
        <header style={topHeaderStyle}>
          <div style={welcomeTextStyle}>
            <span>환영합니다, <strong>{isLoggedIn ? userEmail.split('@')[0] : '최고관리자'}</strong>님</span>
          </div>

          <div style={adminHeaderActionsStyle}>
            <button style={iconBtnStyle} title="알림">
              <Bell size={20} />
            </button>
            <div style={profileGroupStyle}>
              <div style={avatarStyle}>
                <User size={18} />
              </div>
              <span style={adminNameStyle}>{isLoggedIn ? userEmail.split('@')[0] : 'Admin'}</span>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main style={tabBodyStyle}>
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

// Inline Styles
const adminLayoutStyle = {
  display: 'flex',
  backgroundColor: 'var(--bg-secondary)',
  minHeight: '100vh',
  width: '100%',
};

const mainPanelStyle = {
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflowY: 'auto',
};

const topHeaderStyle = {
  height: '70px',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 2.5rem',
  flexShrink: 0,
  position: 'sticky',
  top: 0,
  zIndex: 90,
};

const welcomeTextStyle = {
  fontSize: '0.95rem',
  color: 'var(--text-dark)',
};

const adminHeaderActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
};

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  padding: '0.25rem',
  borderRadius: '50%',
  transition: 'var(--transition-smooth)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const profileGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
};

const avatarStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-gold-light)',
  color: 'var(--primary-gold-hover)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const adminNameStyle = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: 'var(--text-dark)',
};

const tabBodyStyle = {
  padding: '2.5rem',
  flexGrow: 1,
};

export default Admin;
