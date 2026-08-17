import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../utils/supabase';

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        if (onLoginSuccess) {
          onLoginSuccess(data.user.email);
        }
        navigate('/');
      }
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials' 
          ? '이메일 또는 비밀번호가 올바르지 않습니다.' 
          : err.message || '로그인 중 오류가 발생했습니다.'
      );
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

        {/* Login Card */}
        <div style={cardStyle} className="animate-fade-in">
          
          <div style={headerStyle}>
            <h1 style={titleStyle}>로그인</h1>
            <p style={subtitleStyle}>금막창 멤버십 서비스를 위해 로그인해 주세요.</p>
          </div>

          <form onSubmit={handleSubmit} style={formStyle}>
            
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

            {/* Password Field */}
            <div style={inputGroupStyle}>
              <label style={labelStyle}>비밀번호</label>
              <div style={inputWrapperStyle}>
                <Lock size={18} style={inputIconStyle} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '3.2rem' }}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  style={eyeButtonStyle}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn-gold" 
              style={submitButtonStyle}
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인하기'}
            </button>

          </form>

          {/* Toggle Signup Link */}
          <div style={toggleContainerStyle}>
            <p style={toggleTextStyle}>
              계정이 없으신가요?{' '}
              <Link to="/signup" style={toggleLinkStyle}>
                회원가입하기
              </Link>
            </p>
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

const eyeButtonStyle = {
  position: 'absolute',
  right: '1rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  padding: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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

const toggleTextStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
};

const toggleLinkStyle = {
  color: 'var(--primary-gold)',
  fontWeight: '700',
  cursor: 'pointer',
  marginLeft: '0.25rem',
};

export default Login;
