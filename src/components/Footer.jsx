import React from 'react';
import { Crown, Phone, MapPin, Mail } from 'lucide-react';

function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        {/* Info Brand Column */}
        <div style={infoColStyle}>
          <div style={logoStyle}>
            <img 
              src="/geummakchang_logo.png" 
              alt="금막창 로고" 
              style={{ height: '38px', objectFit: 'contain', display: 'block', filter: 'brightness(0) invert(1)' }} 
            />
          </div>
          <p style={descStyle}>
            특허받은 누룩소금 저온숙성 공법으로 빚어낸 극강의 부드러움과 고소함.<br />
            금막창은 대나무 참숯 향 가득한 초벌구이로 최상의 다이닝을 선물합니다.
          </p>
          <div style={snsContainerStyle}>
            <a 
              href="https://www.instagram.com/geummakchang/" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={snsLinkStyle}
              title="금막창 인스타그램 바로가기"
            >
              <svg 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ flexShrink: 0 }}
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>@geummakchang</span>
            </a>
          </div>
        </div>

        {/* Business Info Column (종로점) */}
        <div style={businessColStyle}>
          <h4 style={headingStyle}>STORE & BUSINESS INFO (종로점)</h4>
          <p style={businessTextStyle}>
            상호명: 금막창 종로점 | 대표자: 홍길동<br />
            매장 주소: 서울특별시 종로구 삼일대로 385 (관철동 12-13) 1층 금막창 종로점<br />
            매장 전화: 02-730-9292 | 영업시간: 매일 16:00 ~ 02:00 (연중무휴)<br />
            사업자등록번호: 101-86-98765 | 개인정보보호책임자: 김철수 (privacy@geummakchang.com)
          </p>
        </div>
      </div>
      
      {/* Copyright Bar */}
      <div style={copyrightStyle}>
        <div style={copyrightContentStyle}>
          <span>© 2026 GEUMMAKCHANG. All Rights Reserved.</span>
          <span style={linksStyle}>
            <a href="#" style={linkItemStyle}>이용약관</a>
            <span style={dotStyle}>·</span>
            <a href="#" style={linkItemStyle}>개인정보처리방침</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

const footerStyle = {
  backgroundColor: 'var(--bg-dark)',
  color: 'var(--text-light-muted)',
  padding: '4rem 0 0 0',
  width: '100%',
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 2rem 3rem 2rem',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '3rem',
  justifyContent: 'space-between',
};

const infoColStyle = {
  flex: '1 1 300px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const logoTextStyle = {
  fontSize: '1.5rem',
  fontWeight: '900',
  color: 'var(--text-light)',
  letterSpacing: '0.1rem',
};

const descStyle = {
  fontSize: '0.9rem',
  lineHeight: '1.6',
  color: 'var(--text-light-muted)',
};

const snsContainerStyle = {
  display: 'flex',
  marginTop: '0.5rem',
};

const snsLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: '#2a201c',
  border: '1px solid var(--border-color-dark)',
  borderRadius: '30px',
  padding: '0.5rem 1.2rem',
  fontSize: '0.85rem',
  color: 'var(--primary-gold)',
  fontWeight: '600',
  transition: 'var(--transition-smooth)',
  ':hover': {
    backgroundColor: 'var(--primary-gold)',
    color: 'var(--text-light)',
    borderColor: 'var(--primary-gold)',
  }
};

const detailsColStyle = {
  flex: '1 1 250px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const headingStyle = {
  fontSize: '1rem',
  fontWeight: '700',
  color: 'var(--text-light)',
  letterSpacing: '0.05rem',
  borderBottom: '2px solid var(--primary-gold)',
  paddingBottom: '0.5rem',
  width: 'fit-content',
};

const listStyle = {
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const listItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  fontSize: '0.9rem',
};

const iconStyle = {
  color: 'var(--primary-gold)',
  flexShrink: 0,
};

const businessColStyle = {
  flex: '1 1 300px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const businessTextStyle = {
  fontSize: '0.85rem',
  lineHeight: '1.8',
  color: 'var(--text-light-muted)',
};

const copyrightStyle = {
  borderTop: '1px solid var(--border-color-dark)',
  padding: '1.5rem 0',
  backgroundColor: '#17110f',
};

const copyrightContentStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1rem',
  fontSize: '0.8rem',
  color: '#8c7e78',
};

const linksStyle = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
};

const linkItemStyle = {
  color: '#8c7e78',
  transition: 'var(--transition-smooth)',
  ':hover': {
    color: 'var(--text-light)',
  }
};

const dotStyle = {
  color: '#4e3f3a',
};

export default Footer;
