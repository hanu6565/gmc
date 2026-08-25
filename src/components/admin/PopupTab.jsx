import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Calendar, Eye, Save, Trash2, Plus } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import DbImage from '../DbImage';
import { saveAsset } from '../../utils/db';
import { processImageUpload, safeSetLocalStorage, validateImageFile } from '../../utils/imageUtils';

function PopupTab() {
  const [popups, setPopups] = useState([]);
  const [isGlobalActive, setIsGlobalActive] = useState(true);

  // Initialize configurations from Supabase on mount
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
          setPopups(config.popups || []);
          setIsGlobalActive(config.active !== false);
        } else {
          loadFallbackPopups();
        }
      } catch (err) {
        console.error('Error fetching popups from Supabase:', err);
        loadFallbackPopups();
      }
    };

    const loadFallbackPopups = () => {
      const savedPopups = localStorage.getItem('geummakchang_popups');
      const savedGlobalActive = localStorage.getItem('geummakchang_popups_active');
      
      if (savedPopups) {
        try {
          setPopups(JSON.parse(savedPopups));
        } catch (e) {
          initializeDefaultPopups();
        }
      } else {
        initializeDefaultPopups();
      }

      if (savedGlobalActive !== null) {
        setIsGlobalActive(savedGlobalActive === 'true');
      }
    };

    fetchPopups();
  }, []);

  const initializeDefaultPopups = () => {
    const defaultPopups = [
      {
        id: 1,
        title: '금막창 명품 누룩숙성 런칭 기념',
        content: '지금 멤버십에 신규 가입하시면,\n대나무 참숯 초벌구이와 곁들이기 좋은\n[웰컴 수제 떡볶이] 무료 서비스 쿠폰을 드립니다!',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
        startDate: '2026-08-15',
        endDate: '2026-09-15',
        hideToday: true,
        isActive: true
      }
    ];
    setPopups(defaultPopups);
    localStorage.setItem('geummakchang_popups', JSON.stringify(defaultPopups));
    localStorage.setItem('geummakchang_popups_active', 'true');
  };

  const handleSave = async (updatedPopups, globalActive = isGlobalActive) => {
    // Save locally as backup
    localStorage.setItem('geummakchang_popups', JSON.stringify(updatedPopups));
    localStorage.setItem('geummakchang_popups_active', globalActive.toString());
    setPopups(updatedPopups);
    setIsGlobalActive(globalActive);

    try {
      const { error } = await supabase
        .from('configs')
        .upsert({
          id: 'geummakchang_popups_config',
          data: {
            active: globalActive,
            popups: updatedPopups
          },
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('팝업 설정이 성공적으로 저장되었습니다 (Supabase 동기화 완료)!');
    } catch (err) {
      console.error('Error saving popups to Supabase:', err);
      alert('팝업 설정이 로컬에는 저장되었으나, 네트워크 장애로 데이터베이스 동기화에 실패했습니다.');
    }
  };

  const handleAddPopup = () => {
    const newPopup = {
      id: Date.now(),
      title: '새로운 팝업 이벤트',
      content: '팝업에 노출할 내용을 2~3줄 내외로 입력해 주세요.\n(할인 언급 불가, 증정 서비스 명시 가능)',
      image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&auto=format&fit=crop&q=80',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      hideToday: true,
      isActive: true
    };
    const updated = [...popups, newPopup];
    setPopups(updated);
  };

  return (
    <div style={tabContainerStyle}>
      <div style={titleHeaderStyle}>
        <div style={{ flexGrow: 1 }}>
          <h2 style={tabTitleStyle}>팝업 관리</h2>
          <p style={tabSubtitleStyle}>홈페이지 접속 시 최상단에 노출되는 홍보 팝업의 활성화 여부, 내용, 노출 기간을 제어합니다.</p>
        </div>

        {/* Global Toggle Button */}
        <div style={globalToggleAreaStyle}>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
            팝업 전체 활성화:
          </span>
          <button 
            onClick={() => handleSave(popups, !isGlobalActive)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: isGlobalActive ? 'var(--primary-gold-hover)' : 'var(--text-muted)'
            }}
          >
            {isGlobalActive ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {popups.map((popup, idx) => (
          <div key={popup.id} className="card-premium" style={popupCardStyle}>
            <div style={popupHeaderRowStyle}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary-gold-hover)' }}>
                팝업 #{idx + 1} 설정
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    const updated = [...popups];
                    updated[idx].isActive = !updated[idx].isActive;
                    setPopups(updated);
                  }}
                  style={{
                    ...statusBtnStyle,
                    backgroundColor: popup.isActive ? 'var(--primary-gold-light)' : '#f3f4f6',
                    color: popup.isActive ? 'var(--primary-gold-hover)' : 'var(--text-muted)'
                  }}
                >
                  {popup.isActive ? '게시 중' : '비활성'}
                </button>
                
                {popups.length > 1 && (
                  <button 
                    onClick={() => {
                      const updated = popups.filter(p => p.id !== popup.id);
                      setPopups(updated);
                    }}
                    style={deleteBtnStyle}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div style={formGridStyle}>
              {/* Image URL Input & Preview */}
              <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 <label style={labelStyle}>📷 팝업 이미지 업로드 & 미리보기</label>
                 <div style={{
                   width: '100%',
                   height: '180px',
                   backgroundColor: 'var(--bg-secondary)',
                   borderRadius: '8px',
                   border: '1px solid var(--border-color)',
                   overflow: 'hidden',
                   position: 'relative',
                   minWidth: '200px'
                 }}>
                   <DbImage 
                     src={popup.image} 
                     alt={popup.title} 
                     style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   />
                 </div>

                 <div style={inputGroupStyle}>
                   <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                     <input 
                       type="text" 
                       value={popup.image}
                       onChange={(e) => {
                         const updated = [...popups];
                         updated[idx].image = e.target.value;
                         setPopups(updated);
                       }}
                       placeholder="이미지 URL 직접 입력 또는 우측 업로드"
                       style={{ ...inputStyle, flexGrow: 1, fontSize: '0.85rem' }}
                     />
                     <label style={{
                       padding: '0.7rem 0.9rem',
                       backgroundColor: 'var(--primary-gold-light)',
                       color: 'var(--primary-gold-hover)',
                       borderRadius: '6px',
                       fontSize: '0.85rem',
                       fontWeight: '700',
                       cursor: 'pointer',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '0.25rem',
                       border: '1px solid var(--primary-gold)',
                       flexShrink: 0
                     }}>
                       <span>사진 선택</span>
                       <input 
                         type="file" 
                         accept="image/*" 
                         onChange={async (e) => {
                             const file = e.target.files[0];
                             if (!file) return;

                             const validation = validateImageFile(file, 15);
                             if (!validation.valid) {
                               alert(validation.message);
                               return;
                             }

                             try {
                               const imageUrl = await processImageUpload(file, 'assets', 'popups');
                               if (imageUrl) {
                                 const updated = [...popups];
                                 updated[idx].image = imageUrl;
                                 setPopups(updated);
                                 safeSetLocalStorage('geummakchang_popups', updated);

                                 // Immediate DB sync
                                 try {
                                   await supabase
                                     .from('configs')
                                     .upsert({
                                       id: 'geummakchang_popups_config',
                                       data: {
                                         active: isGlobalActive,
                                         popups: updated
                                       },
                                       updated_at: new Date().toISOString()
                                     });
                                 } catch (dbErr) {
                                   console.warn('DB sync notice:', dbErr);
                                 }
                               }
                             } catch (err) {
                               console.error('Error uploading popup image:', err);
                               alert(`[업로드 중 오류 발생]\n이미지 처리 중 문제가 발생했습니다: ${err.message || '파일을 읽을 수 없습니다.'}`);
                             }
                          }}
                         style={{ display: 'none' }}
                       />
                     </label>
                   </div>
                 </div>
              </div>

              {/* Text Fields & Live Preview */}
              <div style={{ flex: '2 1 350px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>✏️ 팝업 상단 제목 (헤드라인 문구)</label>
                  <input 
                    type="text" 
                    value={popup.title}
                    onChange={(e) => {
                      const updated = [...popups];
                      updated[idx].title = e.target.value;
                      setPopups(updated);
                    }}
                    placeholder="예: 금막창 명품 누룩숙성 런칭 기념"
                    style={inputStyle}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>✏️ 팝업 하단 상세 문구 (할인 표현 금지, 증정 혜택 위주)</label>
                  <textarea 
                    value={popup.content}
                    onChange={(e) => {
                      const updated = [...popups];
                      updated[idx].content = e.target.value;
                      setPopups(updated);
                    }}
                    placeholder="팝업 하단에 보일 본문 내용을 작성해 주세요."
                    style={{ ...inputStyle, height: '90px', resize: 'none' }}
                  />
                </div>

                {/* Duration Dates */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ ...inputGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>📅 노출 시작일</label>
                    <input 
                      type="date" 
                      value={popup.startDate}
                      onChange={(e) => {
                        const updated = [...popups];
                        updated[idx].startDate = e.target.value;
                        setPopups(updated);
                      }}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ ...inputGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>📅 노출 종료일</label>
                    <input 
                      type="date" 
                      value={popup.endDate}
                      onChange={(e) => {
                        const updated = [...popups];
                        updated[idx].endDate = e.target.value;
                        setPopups(updated);
                      }}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Hide option */}
                <div style={checkboxGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input 
                      type="checkbox" 
                      checked={popup.hideToday}
                      onChange={(e) => {
                        const updated = [...popups];
                        updated[idx].hideToday = e.target.checked;
                        setPopups(updated);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>"오늘 하루 이 팝업 보지 않기" 하단 버튼 표시</span>
                  </label>
                </div>
              </div>
            </div>

            {/* REAL-TIME POPUP LIVE PREVIEW */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              border: '1px dashed var(--primary-gold)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={18} color="var(--primary-gold-hover)" />
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary-gold-hover)' }}>
                  실시간 방문자 팝업 렌더링 미리보기
                </span>
              </div>
              <div style={{
                width: '320px',
                maxWidth: '100%',
                margin: '0 auto',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(31, 24, 21, 0.15)',
                overflow: 'hidden',
                border: '1px solid var(--border-color)'
              }}>
                {popup.image && (
                  <div style={{ width: '100%', height: '140px', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
                    <DbImage src={popup.image} alt={popup.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.4rem' }}>
                    {popup.title || '제목 없음'}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                    {popup.content || '팝업 문구가 위치합니다.'}
                  </p>
                </div>
                <div style={{ display: 'flex', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', fontSize: '0.75rem' }}>
                  {popup.hideToday && <div style={{ flex: 1, padding: '0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>오늘 하루 보지 않기</div>}
                  <div style={{ flex: 1, padding: '0.5rem', textAlign: 'center', color: 'var(--primary-gold-hover)', fontWeight: 'bold' }}>닫기</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleAddPopup} className="btn-outline-gold" style={{ flexGrow: 1, padding: '0.85rem' }}>
            <Plus size={16} />
            <span>새로운 팝업 슬롯 추가</span>
          </button>
          
          <button 
            onClick={() => handleSave(popups)} 
            className="btn-gold" 
            style={{ flexGrow: 1, padding: '0.85rem' }}
          >
            <Save size={16} />
            <span>모든 팝업 구성 저장 및 웹사이트 즉시 적용</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline Styles
const tabContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  color: 'var(--text-dark)'
};

const titleHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1rem',
  marginBottom: '0.5rem',
};

const tabTitleStyle = {
  fontSize: '1.75rem',
  fontWeight: '800',
};

const tabSubtitleStyle = {
  fontSize: '0.95rem',
  color: 'var(--text-muted)',
};

const globalToggleAreaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: '#ffffff',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)'
};

const popupCardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  padding: '2rem',
};

const popupHeaderRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '0.75rem',
  marginBottom: '1.5rem'
};

const statusBtnStyle = {
  border: 'none',
  padding: '0.35rem 0.75rem',
  borderRadius: '20px',
  fontSize: '0.8rem',
  fontWeight: '700',
  cursor: 'pointer'
};

const deleteBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#ef4444',
  padding: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const formGridStyle = {
  display: 'flex',
  gap: '2rem',
  flexWrap: 'wrap'
};

const imagePreviewStyle = (url) => ({
  width: '100%',
  height: '180px',
  backgroundColor: 'var(--bg-secondary)',
  backgroundImage: `url(${url})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  minWidth: '200px'
});

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--text-muted)'
};

const inputStyle = {
  padding: '0.7rem 1rem',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  fontSize: '0.95rem',
  outline: 'none',
  color: 'var(--text-dark)',
  backgroundColor: '#ffffff'
};

const checkboxGroupStyle = {
  marginTop: '0.5rem'
};

export default PopupTab;
