import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone } from 'lucide-react';
import { supabase } from '../utils/supabase';

function AuthModal({ mode, setMode, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }
      if (!name || !phone) {
        setError('이름과 연락처를 입력해주세요.');
        return;
      }
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            phone: phone
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      alert('회원가입이 완료되었습니다! 가입하신 이메일로 로그인해 주세요.');
      setMode('login');
      return;
    }

    // Login Flow
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(signInError.message === 'Invalid login credentials' ? '이메일 또는 비밀번호가 올바르지 않습니다.' : signInError.message);
      return;
    }

    if (data.user) {
      onLoginSuccess(data.user.email);
      onClose();
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle} className="animate-fade-in">
        <button style={closeButtonStyle} onClick={onClose}>
          <X size={20} />
        </button>
        
        <div style={headerStyle}>
          <h2 style={titleStyle}>{mode === 'login' ? '로그인' : '회원가입'}</h2>
          <p style={subtitleStyle}>
            {mode === 'login' 
              ? '금막창 멤버십으로 특별한 혜택을 누려보세요.' 
              : '금막창 멤버십에 가입하고 포인트 적립 및 예약을 관리해보세요.'}
          </p>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          {mode === 'signup' && (
            <>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>이름</label>
                <div style={inputWrapperStyle}>
                  <User size={18} style={iconStyle} />
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>연락처</label>
                <div style={inputWrapperStyle}>
                  <Phone size={18} style={iconStyle} />
                  <input
                    type="tel"
                    placeholder="010-1234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div style={inputGroupStyle}>
            <label style={labelStyle}>이메일 주소</label>
            <div style={inputWrapperStyle}>
              <Mail size={18} style={iconStyle} />
              <input
                type="email"
                placeholder="example@geummakchang.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>비밀번호</label>
            <div style={inputWrapperStyle}>
              <Lock size={18} style={iconStyle} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div style={inputGroupStyle}>
              <label style={labelStyle}>비밀번호 확인</label>
              <div style={inputWrapperStyle}>
                <Lock size={18} style={iconStyle} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-gold" style={submitButtonStyle}>
            {mode === 'login' ? '로그인' : '회원가입 완료'}
          </button>
        </form>

        <div style={toggleContainerStyle}>
          {mode === 'login' ? (
            <p style={toggleTextStyle}>
              계정이 없으신가요?{' '}
              <span style={toggleLinkStyle} onClick={() => setMode('signup')}>
                회원가입하기
              </span>
            </p>
          ) : (
            <p style={toggleTextStyle}>
              이미 계정이 있으신가요?{' '}
              <span style={toggleLinkStyle} onClick={() => setMode('login')}>
                로그인하기
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline styles for Modal to ensure absolute layout precision and zero bleed
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(44, 34, 30, 0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: 'var(--bg-primary)',
  border: '1px solid var(--border-color)',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '450px',
  padding: '2.5rem',
  boxShadow: 'var(--shadow-lg)',
  position: 'relative',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '1.25rem',
  right: '1.25rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  padding: '0.25rem',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'var(--transition-smooth)',
  ':hover': {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-dark)',
  }
};

const headerStyle = {
  marginBottom: '2rem',
  textAlign: 'center',
};

const titleStyle = {
  fontSize: '1.75rem',
  fontWeight: '700',
  color: 'var(--text-dark)',
  marginBottom: '0.5rem',
};

const subtitleStyle = {
  fontSize: '0.9rem',
  color: 'var(--text-muted)',
};

const errorStyle = {
  backgroundColor: '#fdf2f2',
  color: '#ec5959',
  padding: '0.75rem 1rem',
  borderRadius: '6px',
  fontSize: '0.85rem',
  marginBottom: '1rem',
  border: '1px solid #fbd5d5',
  textAlign: 'center',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
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

const iconStyle = {
  position: 'absolute',
  left: '1rem',
  color: 'var(--text-muted)',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem 0.75rem 2.75rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  backgroundColor: '#ffffff',
  fontSize: '0.95rem',
  color: 'var(--text-dark)',
  outline: 'none',
  transition: 'var(--transition-smooth)',
  ':focus': {
    borderColor: 'var(--primary-gold)',
    boxShadow: '0 0 0 3px rgba(197, 168, 128, 0.15)',
  }
};

const submitButtonStyle = {
  width: '100%',
  padding: '0.85rem',
  fontSize: '1rem',
  fontWeight: '600',
  marginTop: '0.5rem',
};

const toggleContainerStyle = {
  marginTop: '1.5rem',
  textAlign: 'center',
};

const toggleTextStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
};

const toggleLinkStyle = {
  color: 'var(--primary-gold-hover)',
  fontWeight: '600',
  cursor: 'pointer',
  textDecoration: 'underline',
};

export default AuthModal;
