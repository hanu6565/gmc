import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, Check, AlertCircle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../utils/supabase';

function Signup() {
  const navigate = useNavigate();

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Term states
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketingSms, setMarketingSms] = useState(false);
  const [marketingEmail, setMarketingEmail] = useState(false);
  const [marketingKakao, setMarketingKakao] = useState(false);

  // Terms detail toggle
  const [showTermsDetail, setShowTermsDetail] = useState(false);
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);

  // Error and UI states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Real-time validations
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordLengthValid, setIsPasswordLengthValid] = useState(false);
  const [isPasswordSpecValid, setIsPasswordSpecValid] = useState(false);
  const [isPasswordMatch, setIsPasswordMatch] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  // Validate Email
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(email));
  }, [email]);

  // Validate Password rules
  useEffect(() => {
    setIsPasswordLengthValid(password.length >= 8);
    const specRegex = /[!@#$%^&*(),.?":{}|<>]/;
    setIsPasswordSpecValid(specRegex.test(password));
  }, [password]);

  // Validate Password Confirm
  useEffect(() => {
    setIsPasswordMatch(password !== '' && password === confirmPassword);
  }, [password, confirmPassword]);

  // Validate Phone
  useEffect(() => {
    // Digits count must be 10 or 11 (standard Korean phone format)
    const digitsOnly = phone.replace(/[^\d]/g, '');
    setIsPhoneValid(digitsOnly.length >= 10 && digitsOnly.length <= 11);
  }, [phone]);

  // Format Phone number automatically on change
  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/[^\d]/g, '');
    
    let formatted = '';
    if (digitsOnly.length <= 3) {
      formatted = digitsOnly;
    } else if (digitsOnly.length <= 7) {
      formatted = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    } else {
      formatted = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7, 11)}`;
    }
    
    setPhone(formatted);
  };

  // Marketing Grouping Checkbox Logic
  const marketingGroupChecked = marketingSms && marketingEmail && marketingKakao;
  const marketingGroupSomeChecked = marketingSms || marketingEmail || marketingKakao;

  const handleMarketingGroupChange = (checked) => {
    setMarketingSms(checked);
    setMarketingEmail(checked);
    setMarketingKakao(checked);
  };

  // Select All logic
  const allChecked = terms && privacy && marketingSms && marketingEmail && marketingKakao;

  const handleSelectAllChange = (checked) => {
    setTerms(checked);
    setPrivacy(checked);
    setMarketingSms(checked);
    setMarketingEmail(checked);
    setMarketingKakao(checked);
  };

  // Form validity check
  const isFormValid = 
    name.trim() !== '' &&
    isEmailValid &&
    isPasswordLengthValid &&
    isPasswordSpecValid &&
    isPasswordMatch &&
    isPhoneValid &&
    terms &&
    privacy;

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError('');
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            phone: phone,
            marketing_sms: marketingSms,
            marketing_email: marketingEmail,
            marketing_kakao: marketingKakao,
            signup_source: 'web_signup_page',
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      setSuccess(true);
      setLoading(false);
      
      // Auto-redirect after 3 seconds or on button click
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setLoading(false);
      setError(err.message || '회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.');
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

        {/* Signup Card */}
        <div style={cardStyle} className="animate-fade-in">
          
          <div style={headerStyle}>
            <h1 style={titleStyle}>회원가입</h1>
            <p style={subtitleStyle}>금막창 멤버십에 오신 것을 환영합니다.</p>
          </div>

          {success ? (
            <div style={successContainerStyle}>
              <div style={successIconWrapperStyle}>
                <ShieldCheck size={48} color="var(--primary-gold)" />
              </div>
              <h3 style={successTitleStyle}>회원가입 성공!</h3>
              <p style={successMessageStyle}>
                가입하신 이메일({email})로 인증 메일이 발송되었습니다.<br />
                인증 완료 후 로그인을 이용해 주세요.
              </p>
              <p style={successRedirectStyle}>3초 후 로그인 페이지로 이동합니다...</p>
              <Link to="/login" className="btn-gold" style={{ width: '100%', marginTop: '1.5rem' }}>
                지금 로그인하기
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={formStyle}>
              
              {error && (
                <div style={errorStyle}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Name field */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>이름 (닉네임) <span style={requiredStyle}>*</span></label>
                <div style={inputWrapperStyle}>
                  <User size={18} style={inputIconStyle} />
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                    required
                  />
                  {name.trim() !== '' && (
                    <Check size={18} style={validIconStyle} />
                  )}
                </div>
              </div>

              {/* Email field */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>이메일 주소 <span style={requiredStyle}>*</span></label>
                <div style={inputWrapperStyle}>
                  <Mail size={18} style={inputIconStyle} />
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      ...inputStyle,
                      borderColor: email === '' ? 'var(--border-color)' : (isEmailValid ? '#2ec4b6' : '#ec5959')
                    }}
                    required
                  />
                  {email !== '' && (
                    isEmailValid ? (
                      <Check size={18} style={{ ...validIconStyle, color: '#2ec4b6' }} />
                    ) : (
                      <AlertCircle size={18} style={{ ...validIconStyle, color: '#ec5959' }} />
                    )
                  )}
                </div>
                {email !== '' && !isEmailValid && (
                  <span style={inputHelpStyleError}>올바른 이메일 형식이 아닙니다.</span>
                )}
              </div>

              {/* Phone number field */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>휴대폰 번호 <span style={requiredStyle}>*</span></label>
                <div style={inputWrapperStyle}>
                  <Phone size={18} style={inputIconStyle} />
                  <input
                    type="tel"
                    placeholder="010-1234-5678"
                    value={phone}
                    onChange={handlePhoneChange}
                    style={{
                      ...inputStyle,
                      borderColor: phone === '' ? 'var(--border-color)' : (isPhoneValid ? '#2ec4b6' : '#ec5959')
                    }}
                    maxLength={13}
                    required
                  />
                  {phone !== '' && (
                    isPhoneValid ? (
                      <Check size={18} style={{ ...validIconStyle, color: '#2ec4b6' }} />
                    ) : (
                      <AlertCircle size={18} style={{ ...validIconStyle, color: '#ec5959' }} />
                    )
                  )}
                </div>
                <span style={inputHelpStyle}>숫자만 입력하면 자동으로 하이픈(-)이 생성됩니다.</span>
              </div>

              {/* Password field */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>비밀번호 <span style={requiredStyle}>*</span></label>
                <div style={inputWrapperStyle}>
                  <Lock size={18} style={inputIconStyle} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      ...inputStyle,
                      borderColor: password === '' ? 'var(--border-color)' : ((isPasswordLengthValid && isPasswordSpecValid) ? '#2ec4b6' : '#ec5959'),
                      paddingRight: '3.2rem'
                    }}
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
                
                {/* Password Criteria Checklist */}
                <div style={checklistStyle}>
                  <div style={checklistItemStyle}>
                    <Check size={14} style={{ color: isPasswordLengthValid ? '#2ec4b6' : 'var(--text-muted)' }} />
                    <span style={{ color: isPasswordLengthValid ? 'var(--text-dark)' : 'var(--text-muted)' }}>8자 이상</span>
                  </div>
                  <div style={checklistItemStyle}>
                    <Check size={14} style={{ color: isPasswordSpecValid ? '#2ec4b6' : 'var(--text-muted)' }} />
                    <span style={{ color: isPasswordSpecValid ? 'var(--text-dark)' : 'var(--text-muted)' }}>특수문자 포함</span>
                  </div>
                </div>
              </div>

              {/* Password confirm field */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>비밀번호 확인 <span style={requiredStyle}>*</span></label>
                <div style={inputWrapperStyle}>
                  <Lock size={18} style={inputIconStyle} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      ...inputStyle,
                      borderColor: confirmPassword === '' ? 'var(--border-color)' : (isPasswordMatch ? '#2ec4b6' : '#ec5959'),
                      paddingRight: '3.2rem'
                    }}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    style={eyeButtonStyle}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword !== '' && (
                  isPasswordMatch ? (
                    <span style={inputHelpStyleSuccess}>비밀번호가 일치합니다.</span>
                  ) : (
                    <span style={inputHelpStyleError}>비밀번호가 일치하지 않습니다.</span>
                  )
                )}
              </div>

              <span style={dividerLineStyle}></span>

              {/* Terms Section */}
              <div style={termsSectionStyle}>
                <h3 style={sectionTitleStyle}>약관 동의</h3>

                {/* All check */}
                <div style={checkboxWrapperStyle}>
                  <label style={allCheckLabelStyle}>
                    <input 
                      type="checkbox" 
                      checked={allChecked}
                      onChange={(e) => handleSelectAllChange(e.target.checked)}
                      style={checkboxStyle}
                    />
                    <span style={{ fontWeight: '700' }}>전체 동의합니다.</span>
                  </label>
                </div>

                <span style={termsDividerStyle}></span>

                {/* Required Term 1 */}
                <div style={checkboxItemStyle}>
                  <div style={checkboxLabelRowStyle}>
                    <label style={checkLabelStyle}>
                      <input 
                        type="checkbox" 
                        checked={terms}
                        onChange={(e) => setTerms(e.target.checked)}
                        style={checkboxStyle}
                      />
                      <span>[필수] 이용약관 동의</span>
                    </label>
                    <button 
                      type="button" 
                      style={toggleDetailsBtnStyle} 
                      onClick={() => setShowTermsDetail(!showTermsDetail)}
                    >
                      {showTermsDetail ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      <span style={{ fontSize: '0.8rem', marginLeft: '2px' }}>보기</span>
                    </button>
                  </div>
                  {showTermsDetail && (
                    <div style={termsTextDrawerStyle}>
                      제 1 조 (목적)
                      본 약관은 금막창(이하 "회사")이 제공하는 모든 서비스의 이용조건 및 절차, 회원과 회사 간의 권리, 의무 및 책임 사항 규정을 목적으로 합니다.
                      <br /><br />
                      제 2 조 (서비스의 제공 및 변경)
                      회사는 회원에게 포인트 적립, 매장 예약 관리, 할인 쿠폰 제공 등 다양한 멤버십 혜택을 제공합니다.
                    </div>
                  )}
                </div>

                {/* Required Term 2 */}
                <div style={checkboxItemStyle}>
                  <div style={checkboxLabelRowStyle}>
                    <label style={checkLabelStyle}>
                      <input 
                        type="checkbox" 
                        checked={privacy}
                        onChange={(e) => setPrivacy(e.target.checked)}
                        style={checkboxStyle}
                      />
                      <span>[필수] 개인정보 수집 및 이용 동의</span>
                    </label>
                    <button 
                      type="button" 
                      style={toggleDetailsBtnStyle} 
                      onClick={() => setShowPrivacyDetail(!showPrivacyDetail)}
                    >
                      {showPrivacyDetail ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      <span style={{ fontSize: '0.8rem', marginLeft: '2px' }}>보기</span>
                    </button>
                  </div>
                  {showPrivacyDetail && (
                    <div style={termsTextDrawerStyle}>
                      1. 개인정보 수집 목적: 회원 가입 및 서비스 관리, 예약 처리, 혜택 제공.
                      <br />
                      2. 수집하는 개인정보 항목: 이름, 이메일 주소, 연락처(휴대폰 번호).
                      <br />
                      3. 보유 및 이용 기간: 회원 탈퇴 시까지 또는 법정 보존 기간까지.
                    </div>
                  )}
                </div>

                {/* Optional Marketing Term */}
                <div style={{ ...checkboxItemStyle, marginBottom: '0.5rem' }}>
                  <div style={checkboxLabelRowStyle}>
                    <label style={checkLabelStyle}>
                      <input 
                        type="checkbox" 
                        checked={marketingGroupSomeChecked}
                        onChange={(e) => handleMarketingGroupChange(e.target.checked)}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = marketingGroupSomeChecked && !marketingGroupChecked;
                          }
                        }}
                        style={checkboxStyle}
                      />
                      <span>[선택] 마케팅 정보 수신 동의</span>
                    </label>
                  </div>
                  
                  {/* Marketing Sub Checkboxes */}
                  <div style={subMarketingContainerStyle}>
                    <label style={subCheckLabelStyle}>
                      <input 
                        type="checkbox" 
                        checked={marketingSms}
                        onChange={(e) => setMarketingSms(e.target.checked)}
                        style={checkboxStyle}
                      />
                      <span>SMS</span>
                    </label>
                    <label style={subCheckLabelStyle}>
                      <input 
                        type="checkbox" 
                        checked={marketingEmail}
                        onChange={(e) => setMarketingEmail(e.target.checked)}
                        style={checkboxStyle}
                      />
                      <span>이메일</span>
                    </label>
                    <label style={subCheckLabelStyle}>
                      <input 
                        type="checkbox" 
                        checked={marketingKakao}
                        onChange={(e) => setMarketingKakao(e.target.checked)}
                        style={checkboxStyle}
                      />
                      <span>카카오 알림톡</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn-gold" 
                style={{
                  ...submitButtonStyle,
                  opacity: isFormValid ? 1 : 0.6,
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                  transform: isFormValid ? undefined : 'none',
                  boxShadow: isFormValid ? undefined : 'none'
                }}
                disabled={!isFormValid || loading}
              >
                {loading ? '가입 처리 중...' : '회원가입하기'}
              </button>

            </form>
          )}

          {/* Toggle Login Link */}
          <div style={toggleContainerStyle}>
            <p style={toggleTextStyle}>
              이미 계정이 있으신가요?{' '}
              <Link to="/login" style={toggleLinkStyle}>
                로그인
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
  maxWidth: '480px',
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
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
};

const requiredStyle = {
  color: 'var(--accent-color)',
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

const validIconStyle = {
  position: 'absolute',
  right: '1rem',
  color: '#2ec4b6',
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

const inputHelpStyle = {
  fontSize: '0.78rem',
  color: 'var(--text-muted)',
  marginTop: '0.1rem',
};

const inputHelpStyleError = {
  fontSize: '0.78rem',
  color: '#ec5959',
  marginTop: '0.1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
};

const inputHelpStyleSuccess = {
  fontSize: '0.78rem',
  color: '#2ec4b6',
  marginTop: '0.1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
};

const checklistStyle = {
  display: 'flex',
  gap: '1rem',
  marginTop: '0.25rem',
};

const checklistItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  fontSize: '0.78rem',
};

const dividerLineStyle = {
  height: '1px',
  backgroundColor: 'var(--border-color)',
  margin: '0.5rem 0',
  width: '100%',
};

const termsSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const sectionTitleStyle = {
  fontSize: '0.95rem',
  fontWeight: '700',
  color: 'var(--text-dark)',
  marginBottom: '0.25rem',
};

const checkboxWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
};

const allCheckLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  fontSize: '0.95rem',
  color: 'var(--text-dark)',
};

const termsDividerStyle = {
  height: '1px',
  backgroundColor: 'var(--border-color)',
  margin: '0.25rem 0',
};

const checkboxItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const checkboxLabelRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const checkLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  fontSize: '0.88rem',
  color: 'var(--text-dark)',
};

const toggleDetailsBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.8rem',
};

const termsTextDrawerStyle = {
  padding: '0.75rem 1rem',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '8px',
  fontSize: '0.78rem',
  color: 'var(--text-muted)',
  lineHeight: '1.4',
  border: '1px solid var(--border-color)',
  maxHeight: '100px',
  overflowY: 'auto',
};

const subMarketingContainerStyle = {
  display: 'flex',
  gap: '1.25rem',
  paddingLeft: '1.5rem',
  marginTop: '0.25rem',
};

const subCheckLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  cursor: 'pointer',
  fontSize: '0.8rem',
  color: 'var(--text-muted)',
};

const checkboxStyle = {
  accentColor: 'var(--primary-gold)',
  width: '16px',
  height: '16px',
  cursor: 'pointer',
};

const submitButtonStyle = {
  width: '100%',
  padding: '0.9rem',
  fontSize: '1rem',
  fontWeight: '600',
  marginTop: '0.75rem',
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

const successContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: '1rem 0',
};

const successIconWrapperStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-gold-light)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1.5rem',
};

const successTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: '700',
  color: 'var(--text-dark)',
  marginBottom: '0.75rem',
};

const successMessageStyle = {
  fontSize: '0.9rem',
  color: 'var(--text-muted)',
  lineHeight: '1.6',
  marginBottom: '1.5rem',
};

const successRedirectStyle = {
  fontSize: '0.8rem',
  color: 'var(--text-muted)',
};

export default Signup;
