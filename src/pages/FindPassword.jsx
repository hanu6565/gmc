import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, AlertCircle, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../utils/supabase';

function FindPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('이메일 주소를 입력해 주세요.');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (resetError) {
        throw resetError;
      }

      setMessage('입력하신 이메일로 비밀번호 재설정 메일이 발송되었습니다. 메일함의 지침을 따라 주세요.');
      setLoading(false);
    } catch (err) {
      setError(err.message || '비밀번호 재설정 메일 전송 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={pageContainerStyle}>
        
        {/* Simple Brand Header */}
        <div style={brandHeaderStyle}>
          <Link to="/" style={brandLogoLinkStyle}>
            <img 
              src="/geummakchang_logo.png" 
              alt="금막창" 
              style={logoImgStyle} 
            />
          </Link>
        </div>

        {/* Find Password Card */}
        <div style={cardStyle} className="animate-fade-in">
          
          <div style={headerStyle}>
            <h1 style={titleStyle}>비밀번호 찾기</h1>
            <p style={subtitleStyle}>가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
          </div>

          {message ? (
            <div style={successContainerStyle}>
              <div style={successIconWrapperStyle}>
                <Check size={36} color="var(--primary-gold)" />
              </div>
              <p style={successMessageStyle}>{message}</p>
              <Link to="/login" className="btn-gold" style={{ width: '100%', marginTop: '1rem' }}>
                로그인 페이지로 이동
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} style={formStyle}>
              
              {error && (
                <div style={errorStyle}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>이메일 주소</label>
                <div style={inputWrapperStyle}>
                  <Mail size={18} style={inputIconStyle} />
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn-gold" 
                style={submitButtonStyle}
                disabled={loading}
              >
                {loading ? '전송 중...' : '비밀번호 재설정 메일 전송'}
              </button>

            </form>
          )}

          {/* Go Back Link */}
          <div style={toggleContainerStyle}>
            <Link to="/login" style={backLinkStyle}>
              <ArrowLeft size={16} />
              <span>로그인 페이지로 돌아가기</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

// Styling definitions
const pageWrapperStyle = {
  backgroundColor: 'var(--bg-primary)',
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem 1rem',
};

const pageContainerStyle = {
  width: '100%',
  maxWidth: '450px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const brandHeaderStyle = {
  textAlign: 'center',
  marginBottom: '0.5rem',
};

const brandLogoLinkStyle = {
  display: 'inline-block',
  transition: 'var(--transition-smooth)',
  ':hover': {
    transform: 'scale(1.02)'
  }
};

const logoImgStyle = {
  height: '52px',
  objectFit: 'contain',
};

const cardStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '16px',
  padding: '2.5rem 2rem',
  boxShadow: 'var(--shadow-lg)',
  width: '100%',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '2rem',
};

const titleStyle = {
  fontSize: '1.75rem',
  fontWeight: '800',
  color: 'var(--text-dark)',
  marginBottom: '0.5rem',
  letterSpacing: '-0.025em',
};

const subtitleStyle = {
  fontSize: '0.9rem',
  color: 'var(--text-muted)',
  lineHeight: '1.5',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const errorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: '#fdf2f2',
  color: '#ec5959',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  fontSize: '0.85rem',
  border: '1px solid #fbd5d5',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-dark)',
};

const inputWrapperStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const inputIconStyle = {
  position: 'absolute',
  left: '1rem',
  color: 'var(--text-muted)',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 2.75rem',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  backgroundColor: '#ffffff',
  fontSize: '0.95rem',
  color: 'var(--text-dark)',
  outline: 'none',
  transition: 'var(--transition-smooth)',
};

const submitButtonStyle = {
  width: '100%',
  padding: '0.9rem',
  fontSize: '1rem',
  fontWeight: '600',
  marginTop: '0.5rem',
  border: 'none',
  borderRadius: '8px',
  transition: 'var(--transition-smooth)',
};

const toggleContainerStyle = {
  marginTop: '1.5rem',
  textAlign: 'center',
};

const backLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'var(--transition-smooth)',
  textDecoration: 'none',
  ':hover': {
    color: 'var(--primary-gold)',
  }
};

const successContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: '1rem 0',
};

const successIconWrapperStyle = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-gold-light)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1.25rem',
};

const successMessageStyle = {
  fontSize: '0.9rem',
  color: 'var(--text-muted)',
  lineHeight: '1.6',
  marginBottom: '1.25rem',
};

export default FindPassword;
