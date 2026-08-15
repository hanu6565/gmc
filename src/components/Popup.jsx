import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../utils/supabase';
import DbImage from './DbImage';

function Popup() {
  const [activePopups, setActivePopups] = useState([]);

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const { data, error } = await supabase
          .from('configs')
          .select('data')
          .eq('id', 'geummakchang_popups_config')
          .single();
        if (data && data.data) {
          const config = data.data;
          if (!config.active) {
            setActivePopups([]);
            return;
          }
          
          const todayStr = new Date().toISOString().split('T')[0];
          const filtered = (config.popups || []).filter(popup => {
            if (!popup.isActive) return false;
            if (popup.startDate && todayStr < popup.startDate) return false;
            if (popup.endDate && todayStr > popup.endDate) return false;
            
            const dismissedTime = localStorage.getItem(`geummakchang_dismiss_${popup.id}`);
            if (dismissedTime) {
              const timeDiff = Date.now() - parseInt(dismissedTime, 10);
              const oneDayMs = 24 * 60 * 60 * 1000;
              if (timeDiff < oneDayMs) {
                return false; // Still within 24 hours
              }
            }
            return true;
          });
          setActivePopups(filtered);
        } else {
          loadFallbackPopups();
        }
      } catch (err) {
        console.error('Error fetching popups from Supabase:', err);
        loadFallbackPopups();
      }
    };

    const loadFallbackPopups = () => {
      const isGlobalActive = localStorage.getItem('geummakchang_popups_active') !== 'false';
      if (!isGlobalActive) return;
      const savedPopups = localStorage.getItem('geummakchang_popups');
      if (savedPopups) {
        try {
          const parsed = JSON.parse(savedPopups);
          const todayStr = new Date().toISOString().split('T')[0];
          const filtered = parsed.filter(popup => {
            if (!popup.isActive) return false;
            if (popup.startDate && todayStr < popup.startDate) return false;
            if (popup.endDate && todayStr > popup.endDate) return false;
            const dismissedTime = localStorage.getItem(`geummakchang_dismiss_${popup.id}`);
            if (dismissedTime) {
              const timeDiff = Date.now() - parseInt(dismissedTime, 10);
              const oneDayMs = 24 * 60 * 60 * 1000;
              if (timeDiff < oneDayMs) return false;
            }
            return true;
          });
          setActivePopups(filtered);
        } catch (e) {}
      }
    };

    fetchPopups();

    // Subscribe to popups database changes in real-time
    const channel = supabase
      .channel('popup-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'configs' },
        (payload) => {
          if (payload.new && payload.new.id === 'geummakchang_popups_config') {
            const config = payload.new.data;
            if (!config.active) {
              setActivePopups([]);
              return;
            }
            const todayStr = new Date().toISOString().split('T')[0];
            const filtered = (config.popups || []).filter(popup => {
              if (!popup.isActive) return false;
              if (popup.startDate && todayStr < popup.startDate) return false;
              if (popup.endDate && todayStr > popup.endDate) return false;
              const dismissedTime = localStorage.getItem(`geummakchang_dismiss_${popup.id}`);
              if (dismissedTime) {
                const timeDiff = Date.now() - parseInt(dismissedTime, 10);
                const oneDayMs = 24 * 60 * 60 * 1000;
                if (timeDiff < oneDayMs) return false;
              }
              return true;
            });
            setActivePopups(filtered);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const closePopup = (id) => {
    setActivePopups(prev => prev.filter(p => p.id !== id));
  };

  const dismissPopupToday = (id) => {
    localStorage.setItem(`geummakchang_dismiss_${id}`, Date.now().toString());
    closePopup(id);
  };

  if (activePopups.length === 0) return null;

  return (
    <div style={popupOverlayStyle}>
      <div style={popupListStyle}>
        {activePopups.map((popup) => (
          <div key={popup.id} style={popupBoxStyle} className="animate-fade-in">
            {/* Popup Image */}
            {popup.image && (
              <div style={{
                width: '100%',
                height: '190px',
                backgroundColor: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <DbImage 
                  src={popup.image} 
                  alt={popup.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            )}
            
            {/* Popup Body */}
            <div style={popupBodyStyle}>
              <h4 style={popupTitleStyle}>{popup.title}</h4>
              <p style={popupContentStyle}>
                {popup.content.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </div>

            {/* Popup Actions */}
            <div style={popupActionStyle}>
              {popup.hideToday && (
                <button 
                  onClick={() => dismissPopupToday(popup.id)} 
                  style={actionBtnLeftStyle}
                >
                  오늘 하루 보지 않기
                </button>
              )}
              <button 
                onClick={() => closePopup(popup.id)} 
                style={actionBtnRightStyle}
              >
                닫기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Styles
const popupOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(31, 24, 21, 0.45)', // Muted dark coffee overlay
  backdropFilter: 'blur(3px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  padding: '1.5rem'
};

const popupListStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: '1.5rem',
  flexWrap: 'wrap',
  justifyContent: 'center',
  maxWidth: '100%',
  maxHeight: '100%',
  overflowY: 'auto'
};

const popupBoxStyle = {
  width: '360px',
  maxWidth: '100%',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 20px 50px rgba(31, 24, 21, 0.25)',
  border: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const popupImageAreaStyle = (url) => ({
  width: '100%',
  height: '190px',
  backgroundImage: `url(${url})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundColor: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border-color)'
});

const popupBodyStyle = {
  padding: '1.5rem',
  textAlign: 'center',
  flexGrow: 1
};

const popupTitleStyle = {
  fontSize: '1.15rem',
  fontWeight: '800',
  color: 'var(--text-dark)',
  marginBottom: '0.75rem',
  lineHeight: '1.4'
};

const popupContentStyle = {
  fontSize: '0.9rem',
  color: 'var(--text-muted)',
  lineHeight: '1.6'
};

const popupActionStyle = {
  display: 'flex',
  borderTop: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-secondary)'
};

const actionBtnLeftStyle = {
  flex: 1,
  background: 'none',
  border: 'none',
  padding: '0.85rem',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  borderRight: '1px solid var(--border-color)',
  textAlign: 'center',
  transition: 'var(--transition-smooth)',
  outline: 'none',
  ':hover': {
    backgroundColor: '#ffffff',
    color: 'var(--text-dark)'
  }
};

const actionBtnRightStyle = {
  flex: 1,
  background: 'none',
  border: 'none',
  padding: '0.85rem',
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--primary-gold-hover)',
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'var(--transition-smooth)',
  outline: 'none',
  ':hover': {
    backgroundColor: '#ffffff'
  }
};

export default Popup;
