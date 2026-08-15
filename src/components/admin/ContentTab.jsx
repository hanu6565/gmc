import React, { useState, useEffect } from 'react';
import { Video, Type, Grid, Award, MapPin, Plus, Trash2, ArrowUp, ArrowDown, Save, AlertTriangle } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import DbImage from '../DbImage';
import { saveAsset, getAsset } from '../../utils/db';

function ContentTab() {
  const [activeSubTab, setActiveSubTab] = useState('hero');
  const [config, setConfig] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');

  // Fetch config from Supabase on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('configs')
          .select('data')
          .eq('id', 'geummakchang_config')
          .single();
        if (data && data.data) {
          setConfig(data.data);
        } else {
          loadFallbackConfig();
        }
      } catch (err) {
        console.error('Error fetching config from Supabase:', err);
        loadFallbackConfig();
      }
    };

    const loadFallbackConfig = () => {
      const savedConfig = localStorage.getItem('geummakchang_config');
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (e) {
          initializeDefaultConfig();
        }
      } else {
        initializeDefaultConfig();
      }
    };

    fetchConfig();
  }, []);

  // Load preview video from IndexedDB if active
  useEffect(() => {
    if (config && config.hero.videoType === 'file' && config.hero.videoUrl === 'indexeddb:hero_video') {
      getAsset('hero_video').then(blob => {
        if (blob) {
          const localUrl = URL.createObjectURL(blob);
          setPreviewVideoUrl(localUrl);
        }
      });
    } else {
      setPreviewVideoUrl('');
    }
  }, [config]);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert('동영상 크기가 너무 큽니다. 100MB 이하의 동영상을 업로드해 주세요.');
      return;
    }

    setUploadStatus('동영상을 임시 데이터베이스에 업로드하는 중...');
    try {
      await saveAsset('hero_video', file);
      const updated = {
        ...config,
        hero: {
          ...config.hero,
          videoType: 'file',
          videoUrl: 'indexeddb:hero_video'
        }
      };
      setConfig(updated);
      localStorage.setItem('geummakchang_config', JSON.stringify(updated));
      setUploadStatus('업로드 완료! 홈페이지 메인 및 아래 미리보기에 즉시 적용됩니다.');
      
      const localUrl = URL.createObjectURL(file);
      setPreviewVideoUrl(localUrl);
    } catch (err) {
      console.error(err);
      setUploadStatus('업로드 실패. 다시 시도해 주세요.');
    }
  };

  const initializeDefaultConfig = () => {
    const defaultData = {
      hero: {
        videoType: 'youtube', // 'youtube' or 'file'
        videoUrl: 'https://www.youtube.com/watch?v=P2d8N9u13U8', // Default food grill video
        font: 'Noto Sans KR',
        mainTitle: '황금빛 불판 위에서 피어나는 명품 막창의 풍미',
        subTitle1: '특허받은 누룩소금 저온숙성 공법으로 빚어낸 극강의 부드러움과 고소함',
        subTitle2: '대나무 참숯 향 가득한 초벌구이로 최상의 다이닝을 선물합니다.'
      },
      brandStory: {
        patentNumber: '제 10-2023-0104865호',
        patentName: '누룩소금을 활용한 막창의 발효 저온숙성 공법',
        reviewScore: '4.86',
        reviewCount: '2,486'
      },
      menus: [
        { id: 1, title: '동글막창', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80', desc: '원형 그대로 절단하여 고소한 곱이 가득 차 있는 오리지널 돼지막창' },
        { id: 2, title: '넙적막창', image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&auto=format&fit=crop&q=80', desc: '반 갈라 납작하게 손질하여 노릇하게 구워 바삭하고 쫄깃한 식감의 돼지막창' },
        { id: 3, title: '누룩소금 숙성 소막창', image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&auto=format&fit=crop&q=80', desc: '명인의 누룩소금 저온숙성 공법으로 육질을 극대화한 부드러운 소막창' },
        { id: 4, title: '명품 대파막창', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80', desc: '막창 속에 알싸한 대파를 꽉 채워 한 입 베면 향긋한 대파 즙이 퍼지는 별미' },
        { id: 5, title: '금빛 한우 곱창전골', image: 'https://images.unsplash.com/photo-1547928576-a4a3323dce9d?w=500&auto=format&fit=crop&q=80', desc: '24시간 가마솥에서 우려낸 사골 육수에 곱창과 버섯, 각종 야채가 어우러진 얼큰한 국물' },
        { id: 6, title: '비법 양념 돼지막창', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&auto=format&fit=crop&q=80', desc: '매콤달콤한 비법 양념을 입혀 대나무 참숯 향과 어우러지는 특제 양념구이' },
        { id: 7, title: '벌집 껍데기', image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?w=500&auto=format&fit=crop&q=80', desc: '정교한 벌집 칼집으로 구워내 겉은 크리스피하고 속은 콜라겐 가득 쫀득한 껍데기' },
        { id: 8, title: '누룩소금 에이징 삼겹살', image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&auto=format&fit=crop&q=80', desc: '특허받은 누룩소금 에이징 공법으로 고기 고유의 풍미와 감칠맛을 극한으로 올린 두툼한 구이' },
        { id: 9, title: '대나무 숯불 양념갈비', image: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=500&auto=format&fit=crop&q=80', desc: '대나무 참숯 향이 가득 배어 은은한 풍미를 선사하는 달콤 짭조름한 양념 돼지갈비' }
      ],
      stores: [
        {
          id: 1,
          name: '종로본점',
          address: '대구광역시 중구 중앙대로81길 43',
          phone: '0507-1481-6565',
          hours: '17:00 ~ 24:00 (라스트오더 23:00) / 매주 월요일 정기휴무',
          parking: '매장 바로 앞 주차 가능 및 인근 공영주차장 이용 편리',
          coordinates: '35.8714, 128.5912'
        },
        {
          id: 2,
          name: '월성점',
          address: '대구 달서구 조암로 67 주1동 1층',
          phone: '053-635-6565',
          hours: '17:00 ~ 24:00 (라스트오더 23:00) / 매주 월요일 정기휴무',
          parking: '건물 지하 주차장 이용 가능 및 신월성 공영주차장 도보 2분',
          coordinates: '35.8236, 128.5342'
        },
        {
          id: 3,
          name: '범어점',
          address: '대구 수성구 범어천로 47',
          phone: '053-756-6565',
          hours: '17:00 ~ 24:00 (라스트오더 23:00) / 매주 월요일 정기휴무',
          parking: '매장 뒤편 전용 주차장(10대) 및 범어 복개도로 노상 주차장 이용 편리',
          coordinates: '35.8560, 128.6214'
        }
      ],
      events: [
        {
          id: 1,
          title: '방문자리뷰 약속 증정 이벤트',
          desc: '네이버 영수증 리뷰 작성 약속 시, 매장에서 구워먹는 치즈 5p를 서비스로 즉시 증정합니다.',
          image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&auto=format&fit=crop&q=80',
          startDate: '2026-08-01',
          endDate: '2026-12-31',
          status: 'ongoing',
          type: 'giveaway'
        },
        {
          id: 2,
          title: '신규 멤버십 웰컴 음료 증정',
          desc: '금막창 공식 웹사이트 멤버십 가입 시, 첫 방문 고객 한정으로 탄산음료 또는 수제 식혜 1병을 즉시 증정합니다.',
          image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
          startDate: '2026-08-15',
          endDate: '2026-10-31',
          status: 'ongoing',
          type: 'giveaway'
        }
      ]
    };
    setConfig(defaultData);
    localStorage.setItem('geummakchang_config', JSON.stringify(defaultData));
  };

  const handleSave = async (newConfig) => {
    // Save locally as backup
    localStorage.setItem('geummakchang_config', JSON.stringify(newConfig));
    setConfig(newConfig);
    
    try {
      const { error } = await supabase
        .from('configs')
        .upsert({
          id: 'geummakchang_config',
          data: newConfig,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      alert('홈페이지 콘텐츠 설정이 성공적으로 저장되었습니다 (Supabase 동기화 완료)!');
    } catch (err) {
      console.error('Error saving config to Supabase:', err);
      alert('설정이 로컬에는 저장되었으나, 네트워크 장애로 데이터베이스 동기화에 실패했습니다.');
    }
  };

  // Helper to extract YouTube video ID
  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Verify copy rules for events or descriptions
  const validateCopy = (text) => {
    // Discount expressions check: e.g. 할인, % off, 세일, 원 할인 등
    const discountRegex = /(할인|디스카운트|sale|off|원할인|%할인|값깎|인하)/i;
    // Exaggerated numbers/years check
    const exaggerateRegex = /(\d+년\s*전통|\d+년\s*동안|\d+주년|최고의맛|국내최대|세계최고)/;
    
    if (discountRegex.test(text)) {
      return '가격 할인 단어를 사용할 수 없습니다. 모든 이벤트와 혜택은 반드시 증정형(증정, 서비스 등)으로만 설명되어야 합니다.';
    }
    if (exaggerateRegex.test(text)) {
      return '연도나 수치를 특정하는 과장 표현을 사용할 수 없습니다. 대신 "오랜 시간 이어온 전통" 등으로 표현해 주세요.';
    }
    return '';
  };

  if (!config) return <div style={{ color: 'var(--text-dark)' }}>설정을 불러오는 중...</div>;

  return (
    <div style={tabContainerStyle}>
      <div style={titleHeaderStyle}>
        <h2 style={tabTitleStyle}>홈페이지 콘텐츠 관리</h2>
        <p style={tabSubtitleStyle}>첫 페이지의 동영상, 폰트, 3x3 메뉴 그리드, 브랜드 스토리 배지, 매장 주소를 실시간 편집합니다.</p>
      </div>

      {/* Sub tabs navigation */}
      <div style={subTabRowStyle}>
        <button 
          onClick={() => { setActiveSubTab('hero'); setValidationError(''); }}
          style={{ ...subTabBtnStyle, borderBottom: activeSubTab === 'hero' ? '2px solid var(--primary-gold)' : 'none', color: activeSubTab === 'hero' ? 'var(--primary-gold-hover)' : 'var(--text-muted)' }}
        >
          <Video size={16} />
          <span>히어로 / 영상</span>
        </button>
        <button 
          onClick={() => { setActiveSubTab('menus'); setValidationError(''); }}
          style={{ ...subTabBtnStyle, borderBottom: activeSubTab === 'menus' ? '2px solid var(--primary-gold)' : 'none', color: activeSubTab === 'menus' ? 'var(--primary-gold-hover)' : 'var(--text-muted)' }}
        >
          <Grid size={16} />
          <span>메뉴 그리드 (3x3)</span>
        </button>
        <button 
          onClick={() => { setActiveSubTab('brand'); setValidationError(''); }}
          style={{ ...subTabBtnStyle, borderBottom: activeSubTab === 'brand' ? '2px solid var(--primary-gold)' : 'none', color: activeSubTab === 'brand' ? 'var(--primary-gold-hover)' : 'var(--text-muted)' }}
        >
          <Award size={16} />
          <span>브랜드 스토리 & 수치</span>
        </button>
        <button 
          onClick={() => { setActiveSubTab('stores'); setValidationError(''); }}
          style={{ ...subTabBtnStyle, borderBottom: activeSubTab === 'stores' ? '2px solid var(--primary-gold)' : 'none', color: activeSubTab === 'stores' ? 'var(--primary-gold-hover)' : 'var(--text-muted)' }}
        >
          <MapPin size={16} />
          <span>매장 정보 관리</span>
        </button>
        <button 
          onClick={() => { setActiveSubTab('events'); setValidationError(''); }}
          style={{ ...subTabBtnStyle, borderBottom: activeSubTab === 'events' ? '2px solid var(--primary-gold)' : 'none', color: activeSubTab === 'events' ? 'var(--primary-gold-hover)' : 'var(--text-muted)' }}
        >
          <Award size={16} />
          <span>이벤트 / 소식</span>
        </button>
      </div>

      {/* Dynamic Sub Tab Contents */}
      <div className="card-premium" style={contentCardStyle}>
        
        {/* SUBTAB: HERO */}
        {activeSubTab === 'hero' && (
          <div style={formGridStyle}>
            <h3 style={sectionTitleStyle}>메인 히어로 영상 & 폰트 설정</h3>
            
            <div style={inputGroupStyle}>
              <label style={labelStyle}>배경 영상 타입</label>
              <div style={radioGroupStyle}>
                <label style={radioLabelStyle}>
                  <input 
                    type="radio" 
                    name="videoType" 
                    value="youtube"
                    checked={config.hero.videoType === 'youtube'}
                    onChange={(e) => setConfig({
                      ...config,
                      hero: { ...config.hero, videoType: e.target.value }
                    })}
                  />
                  <span>유튜브 비디오 링크</span>
                </label>
                <label style={radioLabelStyle}>
                  <input 
                    type="radio" 
                    name="videoType" 
                    value="file"
                    checked={config.hero.videoType === 'file'}
                    onChange={(e) => setConfig({
                      ...config,
                      hero: { ...config.hero, videoType: e.target.value }
                    })}
                  />
                  <span>직접 동영상 파일 경로 (MP4)</span>
                </label>
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>영상 주소 (URL)</label>
              <input 
                type="text" 
                value={config.hero.videoUrl} 
                onChange={(e) => setConfig({
                  ...config,
                  hero: { ...config.hero, videoUrl: e.target.value }
                })}
                placeholder={config.hero.videoType === 'youtube' ? '예: https://www.youtube.com/watch?v=P2d8N9u13U8' : '예: /videos/hero.mp4'}
                style={inputStyle}
              />
              {config.hero.videoType === 'youtube' && getYoutubeId(config.hero.videoUrl) && (
                <div style={previewBoxStyle}>
                  <p style={previewTitleStyle}>유튜브 영상 자동 임베드 미리보기</p>
                  <iframe
                    width="100%"
                    height="180"
                    src={`https://www.youtube.com/embed/${getYoutubeId(config.hero.videoUrl)}?mute=1&controls=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    style={{ borderRadius: '8px', marginTop: '0.5rem' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              {config.hero.videoType === 'file' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ ...labelStyle, display: 'block', marginBottom: '0.5rem' }}>동영상 파일 직접 업로드 (100MB 이하 MP4)</label>
                  <input 
                    type="file" 
                    accept="video/mp4,video/*" 
                    onChange={handleVideoUpload}
                    style={{
                      padding: '0.5rem',
                      border: '1px dashed var(--primary-gold)',
                      borderRadius: '6px',
                      width: '100%',
                      cursor: 'pointer',
                      backgroundColor: 'var(--bg-primary)'
                    }}
                  />
                  {uploadStatus && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary-gold-hover)', marginTop: '0.5rem', fontWeight: '700' }}>
                      {uploadStatus}
                    </p>
                  )}
                  {previewVideoUrl && (
                    <div style={previewBoxStyle}>
                      <p style={previewTitleStyle}>업로드 완료 비디오 미리보기</p>
                      <video
                        src={previewVideoUrl}
                        controls
                        muted
                        style={{ width: '100%', maxHeight: '180px', borderRadius: '8px', marginTop: '0.5rem', backgroundColor: '#000' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>히어로 폰트 서체 변경</label>
              <select 
                value={config.hero.font} 
                onChange={(e) => setConfig({
                  ...config,
                  hero: { ...config.hero, font: e.target.value }
                })}
                style={selectStyle}
              >
                <option value="Noto Sans KR">Noto Sans KR (현대적이고 깨끗한 느낌)</option>
                <option value="Gowun Batang">Gowun Batang (전통적이고 기품 있는 서체)</option>
                <option value="Cinzel">Cinzel (로마식 명품 로고느낌 영문서체)</option>
                <option value="Playfair Display">Playfair Display (고급스럽고 우아한 세리프)</option>
              </select>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>메인 카피 (1줄)</label>
              <input 
                type="text" 
                value={config.hero.mainTitle} 
                onChange={(e) => setConfig({
                  ...config,
                  hero: { ...config.hero, mainTitle: e.target.value }
                })}
                style={inputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>서브 카피 (첫 번째 줄)</label>
              <input 
                type="text" 
                value={config.hero.subTitle1} 
                onChange={(e) => setConfig({
                  ...config,
                  hero: { ...config.hero, subTitle1: e.target.value }
                })}
                style={inputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>서브 카피 (두 번째 줄)</label>
              <input 
                type="text" 
                value={config.hero.subTitle2} 
                onChange={(e) => setConfig({
                  ...config,
                  hero: { ...config.hero, subTitle2: e.target.value }
                })}
                style={inputStyle}
              />
            </div>

            <button onClick={() => handleSave(config)} className="btn-gold" style={saveBtnStyle}>
              <Save size={18} />
              <span>히어로 설정 저장</span>
            </button>
          </div>
        )}

        {/* SUBTAB: MENUS */}
        {activeSubTab === 'menus' && (
          <div>
            <h3 style={sectionTitleStyle}>대표 메뉴 관리 (3x3 그리드)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              홈페이지에 3x3 격자 배열로 노출되는 9개 핵심 메뉴 정보 및 순서를 지정합니다.
              <br />
              <strong style={{ color: 'var(--accent-color)' }}>※ 동글막창(원형 그대로 절단), 넙적막창(반 갈라 납작하게) 손질법 표현이 정확해야 합니다.</strong>
            </p>

            <div style={menuListWrapperStyle}>
              {config.menus.map((menu, idx) => (
                <div key={menu.id} style={menuItemCardStyle}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-secondary)',
                    flexShrink: 0,
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <DbImage 
                      src={menu.image} 
                      alt={menu.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        value={menu.title} 
                        onChange={(e) => {
                          const updated = [...config.menus];
                          updated[idx].title = e.target.value;
                          setConfig({ ...config, menus: updated });
                        }}
                        style={{ ...inputStyle, width: '200px', fontWeight: 'bold' }}
                      />
                      <div style={orderBtnGroupStyle}>
                        <button 
                          onClick={() => {
                            if (idx === 0) return;
                            const updated = [...config.menus];
                            const temp = updated[idx];
                            updated[idx] = updated[idx - 1];
                            updated[idx - 1] = temp;
                            setConfig({ ...config, menus: updated });
                          }}
                          disabled={idx === 0}
                          style={orderBtnStyle}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            if (idx === config.menus.length - 1) return;
                            const updated = [...config.menus];
                            const temp = updated[idx];
                            updated[idx] = updated[idx + 1];
                            updated[idx + 1] = temp;
                            setConfig({ ...config, menus: updated });
                          }}
                          disabled={idx === config.menus.length - 1}
                          style={orderBtnStyle}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        value={menu.image} 
                        onChange={(e) => {
                          const updated = [...config.menus];
                          updated[idx].image = e.target.value;
                          setConfig({ ...config, menus: updated });
                        }}
                        placeholder="이미지 주소(URL)"
                        style={{ ...inputStyle, fontSize: '0.8rem', padding: '0.4rem 0.6rem', flexGrow: 1 }}
                      />
                      <label style={{
                        padding: '0.4rem 0.75rem',
                        backgroundColor: 'var(--primary-gold-light)',
                        color: 'var(--primary-gold-hover)',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        border: '1px solid var(--primary-gold)',
                        flexShrink: 0
                      }}>
                        <span>업로드</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            if (file.size > 15 * 1024 * 1024) {
                              alert('이미지 크기는 15MB 이하로 선택해 주세요.');
                              return;
                            }
                            try {
                              const key = `menu_image_${menu.id}`;
                              await saveAsset(key, file);
                              
                              const updated = [...config.menus];
                              updated[idx].image = `indexeddb:${key}`;
                              setConfig({ ...config, menus: updated });
                              
                              localStorage.setItem('geummakchang_config', JSON.stringify({ ...config, menus: updated }));
                            } catch (err) {
                              console.error('Error uploading menu image:', err);
                              alert('이미지 저장 중 오류가 발생했습니다.');
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    <textarea 
                      value={menu.desc} 
                      onChange={(e) => {
                        const updated = [...config.menus];
                        updated[idx].desc = e.target.value;
                        setConfig({ ...config, menus: updated });
                      }}
                      placeholder="메뉴 상세 설명 (최대 2줄 권장)"
                      style={{ ...inputStyle, fontSize: '0.85rem', height: '60px', resize: 'none' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => handleSave(config)} className="btn-gold" style={{ ...saveBtnStyle, marginTop: '1.5rem' }}>
              <Save size={18} />
              <span>메뉴 그리드 순서 & 내용 저장</span>
            </button>
          </div>
        )}

        {/* SUBTAB: BRAND STORY */}
        {activeSubTab === 'brand' && (
          <div style={formGridStyle}>
            <h3 style={sectionTitleStyle}>브랜드 스토리 & 신뢰 지표</h3>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>누룩소금 명인 특허 번호</label>
              <input 
                type="text" 
                value={config.brandStory.patentNumber} 
                onChange={(e) => setConfig({
                  ...config,
                  brandStory: { ...config.brandStory, patentNumber: e.target.value }
                })}
                placeholder="예: 특허 제 10-2023-XXXXXXX호"
                style={inputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>명인 특허 명칭</label>
              <input 
                type="text" 
                value={config.brandStory.patentName} 
                onChange={(e) => setConfig({
                  ...config,
                  brandStory: { ...config.brandStory, patentName: e.target.value }
                })}
                placeholder="특허 정식 명칭을 입력하세요"
                style={inputStyle}
              />
            </div>

            <div style={rowInputStyle}>
              <div style={{ ...inputGroupStyle, flex: 1 }}>
                <label style={labelStyle}>방문자 리뷰 평균 별점</label>
                <input 
                  type="text" 
                  value={config.brandStory.reviewScore} 
                  onChange={(e) => setConfig({
                    ...config,
                    brandStory: { ...config.brandStory, reviewScore: e.target.value }
                  })}
                  style={inputStyle}
                />
              </div>

              <div style={{ ...inputGroupStyle, flex: 1 }}>
                <label style={labelStyle}>방문자 리뷰 전체 건수</label>
                <input 
                  type="text" 
                  value={config.brandStory.reviewCount} 
                  onChange={(e) => setConfig({
                    ...config,
                    brandStory: { ...config.brandStory, reviewCount: e.target.value }
                  })}
                  style={inputStyle}
                />
              </div>
            </div>

            <button onClick={() => handleSave(config)} className="btn-gold" style={saveBtnStyle}>
              <Save size={18} />
              <span>브랜드 지표 정보 저장</span>
            </button>
          </div>
        )}

        {/* SUBTAB: STORES */}
        {activeSubTab === 'stores' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={sectionTitleStyle}>매장 위치 및 안내 관리</h3>
              <button 
                onClick={() => {
                  const newStore = {
                    id: Date.now(),
                    name: '새 매장',
                    address: '',
                    phone: '',
                    hours: '17:00 ~ 24:00',
                    parking: '인근 유료 주차장 이용',
                    coordinates: '37.5665, 126.9780'
                  };
                  setConfig({ ...config, stores: [...config.stores, newStore] });
                }}
                className="btn-outline-gold"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <Plus size={14} />
                <span>신규 매장 추가</span>
              </button>
            </div>

            <div style={menuListWrapperStyle}>
              {config.stores.map((store, idx) => (
                <div key={store.id} style={{ ...menuItemCardStyle, flexDirection: 'column', gap: '1rem', border: '1px solid var(--primary-gold)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <input 
                      type="text" 
                      value={store.name} 
                      onChange={(e) => {
                        const updated = [...config.stores];
                        updated[idx].name = e.target.value;
                        setConfig({ ...config, stores: updated });
                      }}
                      placeholder="매장명 (예: 수성못점)"
                      style={{ ...inputStyle, width: '200px', fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--primary-gold-hover)' }}
                    />
                    {config.stores.length > 1 && (
                      <button 
                        onClick={() => {
                          const updated = config.stores.filter(s => s.id !== store.id);
                          setConfig({ ...config, stores: updated });
                        }}
                        style={deleteBtnStyle}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div style={storeFormGridStyle}>
                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>매장 주소</label>
                      <input 
                        type="text" 
                        value={store.address} 
                        onChange={(e) => {
                          const updated = [...config.stores];
                          updated[idx].address = e.target.value;
                          setConfig({ ...config, stores: updated });
                        }}
                        style={inputStyle}
                      />
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>전화번호</label>
                      <input 
                        type="text" 
                        value={store.phone} 
                        onChange={(e) => {
                          const updated = [...config.stores];
                          updated[idx].phone = e.target.value;
                          setConfig({ ...config, stores: updated });
                        }}
                        style={inputStyle}
                      />
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>영업시간</label>
                      <input 
                        type="text" 
                        value={store.hours} 
                        onChange={(e) => {
                          const updated = [...config.stores];
                          updated[idx].hours = e.target.value;
                          setConfig({ ...config, stores: updated });
                        }}
                        style={inputStyle}
                      />
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>주차 안내</label>
                      <input 
                        type="text" 
                        value={store.parking} 
                        onChange={(e) => {
                          const updated = [...config.stores];
                          updated[idx].parking = e.target.value;
                          setConfig({ ...config, stores: updated });
                        }}
                        style={inputStyle}
                      />
                    </div>

                    <div style={inputGroupStyle}>
                      <label style={labelStyle}>지도 검색 좌표 (Latitude, Longitude)</label>
                      <input 
                        type="text" 
                        value={store.coordinates} 
                        onChange={(e) => {
                          const updated = [...config.stores];
                          updated[idx].coordinates = e.target.value;
                          setConfig({ ...config, stores: updated });
                        }}
                        placeholder="예: 35.8714, 128.5912"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => handleSave(config)} className="btn-gold" style={{ ...saveBtnStyle, marginTop: '1.5rem' }}>
              <Save size={18} />
              <span>매장 위치 정보 전체 저장</span>
            </button>
          </div>
        )}

        {/* SUBTAB: EVENTS */}
        {activeSubTab === 'events' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={sectionTitleStyle}>이벤트 / 매장 소식 등록</h3>
              <button 
                onClick={() => {
                  const newEvent = {
                    id: Date.now(),
                    title: '신규 증정 이벤트',
                    desc: '리뷰 참여 시 음료수 1병 서비스 증정',
                    image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&auto=format&fit=crop&q=80',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: 'ongoing',
                    type: 'giveaway'
                  };
                  setConfig({ ...config, events: [newEvent, ...config.events] });
                }}
                className="btn-outline-gold"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <Plus size={14} />
                <span>새 이벤트 추가</span>
              </button>
            </div>

            {validationError && (
              <div style={validationBoxStyle}>
                <AlertTriangle size={18} />
                <span>{validationError}</span>
              </div>
            )}

            <div style={menuListWrapperStyle}>
              {config.events.map((event, idx) => (
                <div key={event.id} style={{ ...menuItemCardStyle, flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontSize: '0.8rem', backgroundColor: event.status === 'ongoing' ? 'var(--primary-gold-light)' : '#f3f4f6', color: event.status === 'ongoing' ? 'var(--primary-gold-hover)' : 'var(--text-muted)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                      {event.status === 'ongoing' ? '진행 중' : '종료됨'}
                    </span>
                    <button 
                      onClick={() => {
                        const updated = config.events.filter(e => e.id !== event.id);
                        setConfig({ ...config, events: updated });
                        setValidationError('');
                      }}
                      style={deleteBtnStyle}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px' }}>
                      <label style={labelStyle}>이벤트 제목</label>
                      <input 
                        type="text" 
                        value={event.title} 
                        onChange={(e) => {
                          const error = validateCopy(e.target.value);
                          if (error) {
                            setValidationError(error);
                            return;
                          }
                          setValidationError('');
                          const updated = [...config.events];
                          updated[idx].title = e.target.value;
                          setConfig({ ...config, events: updated });
                        }}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ flex: '1 1 200px' }}>
                      <label style={labelStyle}>이벤트 종류</label>
                      <select
                        value={event.type}
                        onChange={(e) => {
                          const updated = [...config.events];
                          updated[idx].type = e.target.value;
                          setConfig({ ...config, events: updated });
                        }}
                        style={selectStyle}
                      >
                        <option value="giveaway">증정형 이벤트 (이벤트 규정 준수)</option>
                      </select>
                    </div>
                  </div>

                  {/* Event Image Preview & Upload Control */}
                  <div style={{ display: 'flex', gap: '1.5rem', width: '100%', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <div style={{
                      width: '100px',
                      height: '70px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-secondary)',
                      flexShrink: 0,
                      border: '1px solid var(--border-color)',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <DbImage 
                        src={event.image} 
                        alt={event.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                    
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={labelStyle}>이벤트 이미지</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          value={event.image} 
                          onChange={(e) => {
                            const updated = [...config.events];
                            updated[idx].image = e.target.value;
                            setConfig({ ...config, events: updated });
                          }}
                          placeholder="이미지 주소(URL)"
                          style={{ ...inputStyle, fontSize: '0.8rem', padding: '0.4rem 0.6rem', flexGrow: 1 }}
                        />
                        <label style={{
                          padding: '0.4rem 0.75rem',
                          backgroundColor: 'var(--primary-gold-light)',
                          color: 'var(--primary-gold-hover)',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          border: '1px solid var(--primary-gold)',
                          flexShrink: 0
                        }}>
                          <span>업로드</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              if (file.size > 15 * 1024 * 1024) {
                                alert('이미지 크기는 15MB 이하로 선택해 주세요.');
                                return;
                              }
                              try {
                                const key = `event_image_${event.id}`;
                                await saveAsset(key, file);
                                
                                const updated = [...config.events];
                                updated[idx].image = `indexeddb:${key}`;
                                setConfig({ ...config, events: updated });
                                
                                localStorage.setItem('geummakchang_config', JSON.stringify({ ...config, events: updated }));
                              } catch (err) {
                                console.error('Error uploading event image:', err);
                                alert('이미지 저장 중 오류가 발생했습니다.');
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div style={{ width: '100%' }}>
                    <label style={labelStyle}>이벤트 카드 설명 (할인 문구 작성 불가, 증정형만 기재 가능)</label>
                    <textarea 
                      value={event.desc} 
                      onChange={(e) => {
                        const error = validateCopy(e.target.value);
                        if (error) {
                          setValidationError(error);
                          return;
                        }
                        setValidationError('');
                        const updated = [...config.events];
                        updated[idx].desc = e.target.value;
                        setConfig({ ...config, events: updated });
                      }}
                      placeholder="리뷰 약속 시 구워먹는 치즈 증정 등 가격 할인이 배제된 혜택을 써주세요."
                      style={{ ...inputStyle, height: '70px', resize: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 150px' }}>
                      <label style={labelStyle}>노출 시작 일자</label>
                      <input 
                        type="date" 
                        value={event.startDate} 
                        onChange={(e) => {
                          const updated = [...config.events];
                          updated[idx].startDate = e.target.value;
                          setConfig({ ...config, events: updated });
                        }}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ flex: '1 1 150px' }}>
                      <label style={labelStyle}>노출 종료 일자</label>
                      <input 
                        type="date" 
                        value={event.endDate} 
                        onChange={(e) => {
                          const updated = [...config.events];
                          updated[idx].endDate = e.target.value;
                          setConfig({ ...config, events: updated });
                        }}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ flex: '1 1 150px' }}>
                      <label style={labelStyle}>노출 상태 지정</label>
                      <select 
                        value={event.status} 
                        onChange={(e) => {
                          const updated = [...config.events];
                          updated[idx].status = e.target.value;
                          setConfig({ ...config, events: updated });
                        }}
                        style={selectStyle}
                      >
                        <option value="ongoing">진행 중 게시</option>
                        <option value="ended">조기 종료 / 비공개</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                if (validationError) {
                  alert('입력된 카피에 위반 사항이 있어 저장할 수 없습니다.');
                  return;
                }
                handleSave(config);
              }} 
              className="btn-gold" 
              style={{ ...saveBtnStyle, marginTop: '1.5rem' }}
            >
              <Save size={18} />
              <span>이벤트 카드 설정 저장</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// Inline styles for ContentTab
const tabContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  color: 'var(--text-dark)'
};

const titleHeaderStyle = {
  marginBottom: '0.25rem',
};

const tabTitleStyle = {
  fontSize: '1.75rem',
  fontWeight: '800',
};

const tabSubtitleStyle = {
  fontSize: '0.95rem',
  color: 'var(--text-muted)',
};

const subTabRowStyle = {
  display: 'flex',
  gap: '1.5rem',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '0.25rem'
};

const subTabBtnStyle = {
  background: 'none',
  border: 'none',
  padding: '0.75rem 0.25rem',
  fontSize: '0.95rem',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'var(--transition-smooth)'
};

const contentCardStyle = {
  padding: '2rem',
  border: '1px solid var(--border-color)',
  backgroundColor: '#ffffff',
  borderRadius: '12px'
};

const sectionTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: '700',
  marginBottom: '1.25rem',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '0.5rem'
};

const formGridStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  maxWidth: '700px'
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const rowInputStyle = {
  display: 'flex',
  gap: '1rem'
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

const selectStyle = {
  padding: '0.7rem 1rem',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  fontSize: '0.95rem',
  outline: 'none',
  color: 'var(--text-dark)',
  backgroundColor: '#ffffff',
  cursor: 'pointer'
};

const radioGroupStyle = {
  display: 'flex',
  gap: '2rem',
  marginTop: '0.25rem'
};

const radioLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.9rem',
  cursor: 'pointer'
};

const previewBoxStyle = {
  marginTop: '0.75rem',
  padding: '0.75rem',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '8px',
  border: '1px solid var(--border-color)'
};

const previewTitleStyle = {
  fontSize: '0.8rem',
  fontWeight: '600',
  color: 'var(--text-muted)'
};

const saveBtnStyle = {
  alignSelf: 'flex-start',
  padding: '0.75rem 1.5rem',
  fontSize: '0.95rem',
  marginTop: '1rem'
};

const menuListWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const menuItemCardStyle = {
  display: 'flex',
  gap: '1.5rem',
  padding: '1.25rem',
  backgroundColor: 'var(--bg-primary)',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  alignItems: 'stretch'
};

const menuImagePreviewStyle = (url) => ({
  width: '120px',
  height: '120px',
  borderRadius: '6px',
  backgroundColor: 'var(--bg-secondary)',
  backgroundImage: `url(${url})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  flexShrink: 0,
  border: '1px solid var(--border-color)'
});

const orderBtnGroupStyle = {
  display: 'flex',
  gap: '0.25rem'
};

const orderBtnStyle = {
  padding: '0.3rem',
  borderRadius: '4px',
  border: '1px solid var(--border-color)',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-muted)'
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

const storeFormGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
  width: '100%'
};

const validationBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.85rem 1.25rem',
  backgroundColor: '#fef2f2',
  border: '1px solid #fca5a5',
  borderRadius: '8px',
  color: '#b91c1c',
  fontSize: '0.9rem',
  fontWeight: '600',
  marginBottom: '1rem'
};

export default ContentTab;
