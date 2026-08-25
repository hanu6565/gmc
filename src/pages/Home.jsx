import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Popup from '../components/Popup';
import { Calendar, Users, Phone, User, MapPin, Star, ChevronLeft, ChevronRight, Award, Plus, Layers, Flame, BookOpen, Heart } from 'lucide-react';
import { getAsset } from '../utils/db';
import { supabase } from '../utils/supabase';
import DbImage from '../components/DbImage';

function Home({ openAuth, isLoggedIn, userEmail, userName, isAdmin, handleLogout }) {
  const [config, setConfig] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null); // Accordion menu selector
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0); // Multi-store tab index
  const [reviewIndex, setReviewIndex] = useState(0); // Review slider index
  const [activeEventTab, setActiveEventTab] = useState('ongoing'); // 'ongoing' or 'ended'
  const [selectedEventModal, setSelectedEventModal] = useState(null);
  const [indexedVideoUrl, setIndexedVideoUrl] = useState('');
  
  // Franchise form state
  const [franchiseForm, setFranchiseForm] = useState({ name: '', phone: '', location: '' });

  // Default configuration fallback
  const defaultData = useMemo(() => ({
    hero: {
      videoType: 'youtube',
      videoUrl: 'https://www.youtube.com/watch?v=P2d8N9u13U8',
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
        hours: '11:00 ~ 23:30 (라스트오더 22:30 / 브레이크타임 15:30 ~ 17:00) / 매주 월요일 정기휴무',
        parking: '매장 근처 공영/유료 주차장 이용부탁드립니다.',
        coordinates: '35.8714, 128.5912'
      },
      {
        id: 2,
        name: '월성점',
        address: '대구 달서구 조암로 67 주1동 1층 (월성네거리 코지하우스 옆)',
        phone: '053-635-6565',
        hours: '월~목 16:00 ~ 24:00 (LO 23:00) / 금 16:00 ~ 익일 01:00 (LO 00:00) / 토 12:00 ~ 익일 01:00 (브레이크타임 15:00 ~ 17:00, LO 00:00) / 일 12:00 ~ 23:00 (LO 22:00)',
        parking: '매장 뒤편 주차 가능 / 가게 옆 골목에 주차하시면 됩니다.',
        coordinates: '35.8236, 128.5342'
      },
      {
        id: 3,
        name: '범어점',
        address: '대구 수성구 범어천로 47 (수성구민운동장역 1번 출구에서 311m)',
        phone: '053-756-6565',
        hours: '매일 16:00 ~ 익일 01:00 (라스트오더 00:00)',
        parking: '주차 가능 (유료: 최초 60분 1,000원, 추가 90분당 500원, 최대 6,000원) / 인근 공영주차장: 범어천로3 노상 공영 주차장 (범어동 882-10, 도보 240m)',
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
  }), []);

  // Mock static customer reviews
  const customerReviews = useMemo(() => [
    {
      author: '김*현 (방문객 리뷰)',
      score: 5,
      content: '누룩소금 숙성이라고 해서 기대하고 왔는데 진짜 막창에서 잡내가 아예 안 나요! 입안에 퍼지는 특유의 자연스러운 단맛이 일품입니다. 초벌구이가 되어 나오니 굽는 것도 너무 편하고 편하게 식사했어요.'
    },
    {
      author: '박*진 (방문객 리뷰)',
      score: 5,
      content: '동글막창은 겉바속촉에 씹을수록 곱이 뿜어져 나오고, 넙적막창은 아주 쫄깃하고 바삭하게 씹히는 식감이 환상적이에요! 직원분들도 하나같이 너무 친절하시고 밑반찬도 푸짐하게 깔려서 흠잡을 데가 없네요.'
    },
    {
      author: '이*영 (방문객 리뷰)',
      score: 5,
      content: '대구 갈 때마다 들리는 찐맛집! 소막창 숙성이 정말 명인 특허 받을 만합니다. 질긴 느낌이 하나도 없고 입에서 살살 녹아요. 떡볶이 기본 안주 주시는 것도 엄청 맛있어서 술이 쭉쭉 들어갑니다.'
    }
  ], []);

  // Load config on mount from Supabase
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
      } catch (e) {
        console.error('Error fetching Supabase configs, falling back:', e);
        loadFallbackConfig();
      }
    };

    const loadFallbackConfig = () => {
      const savedConfig = localStorage.getItem('geummakchang_config');
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (e) {
          setConfig(defaultData);
        }
      } else {
        setConfig(defaultData);
      }
    };

    fetchConfig();

    // Subscribe to realtime database changes for settings configurations
    const channel = supabase
      .channel('home-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'configs' },
        (payload) => {
          if (payload.new && payload.new.id === 'geummakchang_config') {
            setConfig(payload.new.data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [defaultData]);

  // Load preview video from IndexedDB if active
  useEffect(() => {
    let createdUrl = null;
    let isMounted = true;
    if (config && config.hero.videoType === 'file' && config.hero.videoUrl === 'indexeddb:hero_video') {
      getAsset('hero_video').then(blob => {
        if (isMounted && blob) {
          createdUrl = URL.createObjectURL(blob);
          setIndexedVideoUrl(createdUrl);
        }
      });
    } else {
      setIndexedVideoUrl('');
    }
    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [config]);

  // Mobile video auto-play trigger ref
  const videoRef = React.useRef(null);

  useEffect(() => {
    const playVideo = () => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    };
    playVideo();
    window.addEventListener('touchstart', playVideo, { once: true });
    window.addEventListener('click', playVideo, { once: true });
    return () => {
      window.removeEventListener('touchstart', playVideo);
      window.removeEventListener('click', playVideo);
    };
  }, [indexedVideoUrl, config]);

  // Video ready state for smooth fade-in without YouTube overlay buttons
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    setIsVideoLoaded(false);
    const timer = setTimeout(() => {
      setIsVideoLoaded(true);
    }, 2200);
    return () => clearTimeout(timer);
  }, [config?.hero?.videoUrl, config?.hero?.videoType]);

  // Helper to extract YouTube ID
  const getYoutubeId = useCallback((url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }, []);

  // Franchise submission handler using Supabase
  const handleFranchiseSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!franchiseForm.name || !franchiseForm.phone || !franchiseForm.location) {
      alert('모든 양식을 올바르게 작성해 주세요.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('franchise_inquiries')
        .insert([
          {
            name: franchiseForm.name,
            phone: franchiseForm.phone,
            location: franchiseForm.location,
            status: '상담 대기'
          }
        ]);

      if (error) throw error;

      alert(`[가맹창업 문의 신청 완료]\n성함: ${franchiseForm.name}님\n연락처: ${franchiseForm.phone}\n희망지역: ${franchiseForm.location}\n\n신속히 담당 가맹본부실에서 안내 전화를 드리겠습니다.`);
      setFranchiseForm({ name: '', phone: '', location: '' });
    } catch (err) {
      console.error('Error inserting franchise inquiry to Supabase:', err);
      // Fallback local storage save
      const savedInquiries = localStorage.getItem('geummakchang_inquiries');
      let inquiriesList = [];
      if (savedInquiries) {
        try { inquiriesList = JSON.parse(savedInquiries); } catch (e) {}
      }
      const newInquiry = {
        id: Date.now(),
        name: franchiseForm.name,
        phone: franchiseForm.phone,
        location: franchiseForm.location,
        date: new Date().toISOString().split('T')[0],
        status: '상담 대기'
      };
      localStorage.setItem('geummakchang_inquiries', JSON.stringify([newInquiry, ...inquiriesList]));
      alert('네트워크 상태 문제로 인해 임시 저장 공간에 접수되었습니다. 신속히 안내 드리겠습니다.');
      setFranchiseForm({ name: '', phone: '', location: '' });
    }
  }, [franchiseForm]);

  // Carousel controls
  const handlePrevReview = useCallback(() => {
    setReviewIndex(prev => (prev === 0 ? customerReviews.length - 1 : prev - 1));
  }, [customerReviews.length]);

  const handleNextReview = useCallback(() => {
    setReviewIndex(prev => (prev === customerReviews.length - 1 ? 0 : prev + 1));
  }, [customerReviews.length]);

  const currentStore = useMemo(() => {
    if (!config || !config.stores) return null;
    return config.stores[selectedStoreIndex] || config.stores[0];
  }, [config, selectedStoreIndex]);

  if (!config) return null;

  return (
    <div style={pageStyle}>
      <Popup />
      
      <Header 
        openAuth={openAuth} 
        isLoggedIn={isLoggedIn} 
        userEmail={userEmail} 
        userName={userName}
        isAdmin={isAdmin}
        handleLogout={handleLogout} 
      />

      {/* SECTION 1: HERO */}
      <section style={heroSectionStyle}>
        {/* Background media element */}
        {config.hero.videoType === 'youtube' && getYoutubeId(config.hero.videoUrl) ? (
          <div style={{
            ...videoBackgroundWrapperStyle,
            opacity: isVideoLoaded ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out'
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeId(config.hero.videoUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYoutubeId(config.hero.videoUrl)}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&autohide=1&enablejsapi=1&playsinline=1`}
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              style={videoBackgroundIframeStyle}
              title="Geum Makchang Hero Background"
            ></iframe>
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            loop 
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            preload="auto"
            style={{
              ...videoBackgroundElementStyle,
              opacity: isVideoLoaded ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out'
            }}
            key={indexedVideoUrl || config.hero.videoUrl}
          >
            <source 
              src={
                indexedVideoUrl || 
                (config.hero.videoUrl.startsWith('indexeddb:') 
                  ? 'https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-meat-on-a-grill-41584-large.mp4' 
                  : config.hero.videoUrl)
              } 
              type="video/mp4" 
            />
          </video>
        )}

        {/* Hero Overlay */}
        <div style={heroOverlayStyle}></div>

        <div style={heroContainerStyle}>
          <div style={{ ...heroContentStyle, fontFamily: config.hero.font || 'Noto Sans KR' }} className="animate-fade-in">
            <span style={heroTagStyle}>A NEW STANDARD, NATURALLY FERMENTED</span>
            <h1 style={heroTitleStyle}>
              {config.hero.mainTitle}
            </h1>
            <p style={heroDescStyle}>
              {config.hero.subTitle1}
              <br />
              {config.hero.subTitle2}
            </p>
            <div style={heroBtnGroupStyle}>
              <button 
                onClick={() => document.getElementById('menu-showcase').scrollIntoView({ behavior: 'smooth' })} 
                className="btn-gold" 
                style={heroBtnStyle}
              >
                <span>메뉴 보기</span>
              </button>
              <button 
                onClick={() => document.getElementById('store-info').scrollIntoView({ behavior: 'smooth' })} 
                className="btn-dark" 
                style={{ ...heroBtnStyle, backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(5px)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <span>오시는 길</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: MENU SHOWCASE (3x3 Grid Accordion) */}
      <section id="menu-showcase" style={menuSectionStyle}>
        <div style={sectionContainerStyle}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={sectionTagStyle}>대표 메뉴</span>
            <h2 style={sectionTitleStyle}>금막창 시그니처 메뉴</h2>
          </div>

          <div style={menuGridStyle} className="menu-grid-responsive">
            {config.menus.slice(0, 9).map((menu) => {
              const isOpen = activeMenuId === menu.id;
              return (
                <div key={menu.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div 
                    onClick={() => setActiveMenuId(isOpen ? null : menu.id)}
                    className="hover-gold-grow"
                    style={{
                      ...menuCardStyle,
                      borderColor: isOpen ? 'var(--primary-gold)' : 'var(--border-color)',
                      boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                    }}
                  >
                    <div style={menuImageWrapperStyle}>
                      <DbImage src={menu.image} alt={menu.title} style={menuImgStyle} />
                      <div style={menuOverlayHoverStyle}>
                        <span>상세 아코디언 {isOpen ? '접기' : '펼치기'}</span>
                      </div>
                    </div>
                    <div style={menuCardInfoStyle}>
                      <h3 style={menuCardTitleStyle}>{menu.title}</h3>
                      <p style={menuCardDescStyle}>{menu.desc}</p>
                    </div>
                  </div>

                  {/* Accordion content with smooth animations */}
                  {isOpen && (
                    <div style={accordionContainerStyle} className="animate-fade-in">
                      <div style={accordionIndicatorStyle}></div>
                      <div style={accordionBodyStyle}>
                        <h4 style={accordionTitleStyle}>{menu.title} 상세안내</h4>
                        
                        {/* Custom exact Guide notes */}
                        {menu.title.includes('동글') && (
                          <div style={highlightBoxStyle}>
                            📌 <strong>손질법 안내:</strong> 원형 그대로 절단하여 겉은 튀기듯 바삭하고, 속은 촉촉한 기름과 곱이 고소하게 흘러나오는 오리지널 비법 손질입니다. 처음이신 고객님께 추천합니다!
                          </div>
                        )}
                        {menu.title.includes('넙적') && (
                          <div style={highlightBoxStyle}>
                            📌 <strong>손질법 안내:</strong> 반 갈라 납작하게 손질하여 흐르는 불판에 기름을 빠르게 털어내 아작아작 씹히는 육질의 탄력과 극한의 쫄깃함을 극대화한 특수 가공 손질법입니다.
                          </div>
                        )}
                        
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-dark)' }}>
                          금막창 쌀누룩 발효 소금에 48시간 이상 저온 침지하여, 일반적인 막창과는 결을 달리하는 극상의 부드러움을 구현하였습니다. 한 번 맛보시면 참숯 향이 밴 깊은 맛을 잊지 못하실 것입니다.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: BRAND STORY (Nuruk salt, master patent, reviews score, sauces) */}
      <section id="brand-story" style={storySectionStyle}>
        <div style={sectionContainerStyle}>
          <div style={storyGridStyle} className="story-grid-responsive">
            {/* Story Left: details */}
            <div style={storyLeftStyle}>
              <span style={sectionTagStyle}>브랜드 소구점</span>
              <h2 style={{ ...sectionTitleStyle, textAlign: 'left', marginBottom: '2rem' }}>
                누룩소금 저온숙성 공법과<br />
                특허 기술로 빚어낸 프리미엄 명가
              </h2>
              
              <p style={storyParagraphStyle}>
                금막창은 오랜 시간 다이닝 숙성 기술을 연마해 온 명인의 비법 공법으로 고기를 완성합니다. 
                쌀을 발효시켜 만든 누룩소금(쌀국균)을 활용하여 막창 본연의 풍미를 보호하고, 
                효소 작용으로 단백질을 천천히 분해해 씹는 식감을 극도로 연화시키는 저온에이징 기법을 적용합니다.
              </p>

              {/* Badges and Patent Details */}
              <div style={storyBadgeGridStyle}>
                <div style={storyBadgeStyle}>
                  <Award size={36} style={storyBadgeIconStyle} />
                  <div>
                    <h4 style={badgeLabelStyle}>명인 특허 공법 등록</h4>
                    <p style={badgeValueStyle}>{config.brandStory.patentNumber}</p>
                    <p style={badgeSubvalueStyle}>({config.brandStory.patentName})</p>
                  </div>
                </div>

                <div style={storyBadgeStyle}>
                  <Star size={36} style={{ ...storyBadgeIconStyle, color: '#f59e0b' }} />
                  <div>
                    <h4 style={badgeLabelStyle}>방문자 리뷰 신뢰지표</h4>
                    <p style={badgeValueStyle}>평균 별점 {config.brandStory.reviewScore}점</p>
                    <p style={badgeSubvalueStyle}>실제 대구 종로본점 영수증 리뷰 {config.brandStory.reviewCount}건 기준</p>
                  </div>
                </div>
              </div>

              {/* Signature Comparison */}
              <div style={comparisonCardStyle}>
                <h4 style={comparisonTitleStyle}>🤔 동글막창 vs 넙적막창, 어떤 걸 드시겠습니까?</h4>
                <div style={comparisonGridStyle}>
                  <div style={comparisonColStyle}>
                    <h5 style={{ fontWeight: '800', color: 'var(--primary-gold-hover)' }}>동글막창</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>원형 그대로 절단하여 지방의 고소함이 팡 터지며 부드러운 목넘김. 처음 방문하는 분들께 강력 추천!</p>
                  </div>
                  <div style={comparisonDividerStyle}></div>
                  <div style={comparisonColStyle}>
                    <h5 style={{ fontWeight: '800', color: 'var(--accent-color)' }}>넙적막창</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>반 갈라 납작하게 구워 바삭하게 구워진 겉면과 쫄깃하고 담백한 식감. 고소하고 아삭함을 선호하는 분 추천!</p>
                  </div>
                </div>
                <div style={comparisonFooterStyle}>
                  💡 <span style={{ fontWeight: '700' }}>고민될 때는? 동글과 넙적, 반반으로 즐기시는 조합을 강력 권장드립니다.</span>
                </div>
              </div>
            </div>

            {/* Story Right: Brand banner image */}
            <div style={{
              flex: '1 1 450px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-dark)'
            }}>
              <img 
                src="/geummakchang_proof.jpg" 
                alt="금막창이 맛을 증명하는 4가지" 
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain'
                }} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: STORE INFO (Multi-store manager, Google map search) */}
      <section id="store-info" style={storeSectionStyle}>
        <div style={sectionContainerStyle}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={sectionTagStyle}>매장 안내</span>
            <h2 style={sectionTitleStyle}>금막창 직영 및 가맹 매장 정보</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>대구 주요 거점에서 최고의 막창 다이닝을 선사해 드립니다.</p>
          </div>

          {/* Tab buttons for multiple stores */}
          <div style={storeTabsWrapperStyle}>
            {config.stores.map((store, index) => (
              <button
                key={store.id}
                onClick={() => setSelectedStoreIndex(index)}
                style={{
                  ...storeTabBtnStyle,
                  backgroundColor: selectedStoreIndex === index ? 'var(--primary-gold)' : 'transparent',
                  color: selectedStoreIndex === index ? '#ffffff' : 'var(--text-dark)',
                  borderColor: selectedStoreIndex === index ? 'var(--primary-gold)' : 'var(--border-color)',
                  fontWeight: selectedStoreIndex === index ? '700' : '500'
                }}
              >
                {store.name}
              </button>
            ))}
          </div>

          {/* Store Info Cards and Map Grid */}
          <div style={storeGridStyle} className="store-grid-responsive">
            <div className="card-premium store-detail-responsive" style={storeDetailCardStyle}>
              <h3 style={storeTitleStyle}>금막창 {currentStore.name}</h3>
              <div style={storeInfoListStyle}>
                <div style={storeInfoItemStyle}>
                  <MapPin size={18} style={storeIconStyle} />
                  <div>
                    <span style={storeInfoLabelStyle}>도로명 주소</span>
                    <p style={storeInfoValueStyle}>{currentStore.address}</p>
                  </div>
                </div>

                <div style={storeInfoItemStyle}>
                  <Phone size={18} style={storeIconStyle} />
                  <div>
                    <span style={storeInfoLabelStyle}>대표 문의 번호 (터치 시 바로 연결)</span>
                    <p style={storeInfoValueStyle}>
                      <a href={`tel:${currentStore.phone.replace(/[^0-9]/g, '')}`} style={{ color: 'var(--primary-gold-hover)', textDecoration: 'underline' }}>
                        {currentStore.phone}
                      </a>
                    </p>
                  </div>
                </div>

                <div style={storeInfoItemStyle}>
                  <Calendar size={18} style={storeIconStyle} />
                  <div>
                    <span style={storeInfoLabelStyle}>영업시간 안내</span>
                    <p style={storeInfoValueStyle}>{currentStore.hours}</p>
                  </div>
                </div>

                <div style={storeInfoItemStyle}>
                  <Users size={18} style={storeIconStyle} />
                  <div>
                    <span style={storeInfoLabelStyle}>주차 공간 정보</span>
                    <p style={storeInfoValueStyle}>{currentStore.parking}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live address map lookup wrapper */}
            <div style={mapCardStyle} className="map-card-responsive">
              <iframe
                title="Google Maps Location Lookup"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '12px' }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(currentStore.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CUSTOMER REVIEWS (Slider Carousel) */}
      <section style={reviewSectionStyle}>
        <div style={sectionContainerStyle}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ ...sectionTagStyle, color: 'var(--primary-gold-hover)' }}>고객 후기</span>
            <h2 style={sectionTitleStyle}>실시간 고객 감동 리뷰</h2>
          </div>

          <div style={reviewSliderContainerStyle} className="review-slider-responsive">
            <button onClick={handlePrevReview} style={sliderArrowBtnStyle}>
              <ChevronLeft size={24} />
            </button>

            <div className="card-premium animate-fade-in review-card-responsive" style={reviewCardStyle} key={reviewIndex}>
              <div style={reviewStarRowStyle}>
                {[...Array(customerReviews[reviewIndex].score)].map((_, i) => (
                  <Star key={i} size={20} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p style={reviewTextStyle}>
                "{customerReviews[reviewIndex].content}"
              </p>
              <h4 style={reviewAuthorStyle}>
                - {customerReviews[reviewIndex].author}
              </h4>
            </div>

            <button onClick={handleNextReview} style={sliderArrowBtnStyle}>
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 6: EVENTS / NEWS (Ongoing/Ended Tabs) */}
      <section style={eventSectionStyle}>
        <div style={sectionContainerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={sectionTagStyle}>NEWS & EVENTS</span>
              <h2 style={{ ...sectionTitleStyle, textAlign: 'left', marginBottom: '0.25rem' }}>금막창 이벤트 & 매장 소식</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>금막창의 신규 매장 오픈 소식, 신메뉴 출시, 브랜드 공지사항 및 다채로운 혜택 소식을 한눈에 확인해 보세요.</p>
            </div>
          </div>

          <div style={eventGridStyle} className="event-grid-responsive">
            {config.events.filter(e => e.status !== 'ended').length > 0 ? (
              config.events
                .filter(e => e.status !== 'ended')
                .map((event) => (
                  <div 
                    key={event.id} 
                    className="card-premium hover-gold-grow" 
                    style={{ ...eventCardStyle, cursor: 'pointer' }}
                    onClick={() => setSelectedEventModal(event)}
                    title="클릭 시 상세 내용 보기"
                  >
                    <div style={{
                      width: '100%',
                      height: '210px',
                      aspectRatio: '16 / 9',
                      position: 'relative',
                      backgroundColor: 'var(--bg-secondary)',
                      overflow: 'hidden'
                    }}>
                      <DbImage 
                        src={event.image} 
                        alt={event.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    {(() => {
                      const getBadge = (type) => {
                        switch (type) {
                          case 'news': return { text: '📢 NEWS (매장 소식)', bg: '#2ec4b6' };
                          case 'opening': return { text: '🎉 OPENING (매장 오픈)', bg: '#e71d36' };
                          case 'menu': return { text: '🍖 NEW MENU (신메뉴)', bg: '#ff9f1c' };
                          case 'promotion': return { text: '✨ PROMOTION (혜택)', bg: '#7026b9' };
                          default: return { text: '🎁 GIVEAWAY (증정)', bg: 'var(--primary-gold)' };
                        }
                      };
                      const b = getBadge(event.type);
                      return (
                        <span style={{ ...eventCardBadgeStyle, backgroundColor: b.bg, color: '#ffffff' }}>
                          {b.text}
                        </span>
                      );
                    })()}
                    </div>
                    <div style={eventCardBodyStyle}>
                      <span style={eventCardPeriodStyle}>{event.startDate} ~ {event.endDate}</span>
                      <h3 style={eventCardTitleStyle}>{event.title}</h3>
                      <p style={eventCardDescStyle}>{event.desc}</p>
                    </div>
                  </div>
                ))
            ) : (
              <div style={emptyEventsBoxStyle}>
                아직 노출 기간이 기재되었거나 {activeEventTab === 'ongoing' ? '진행 중' : '종료된'} 이벤트 소식이 없습니다.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 7: FRANCHISE INQUIRY (LIGHT CRM LEAD INTAKE) */}
      <section style={franchiseSectionStyle}>
        <div style={sectionContainerStyle}>
          <div style={franchiseGridStyle}>
            <div style={franchiseLeftStyle}>
              <span style={{ ...sectionTagStyle, color: 'var(--primary-gold-hover)' }}>창업 문의</span>
              <h2 style={franchiseTitleStyle}>성공의 내일을 여는 파트너,<br />금막창 창업 가입 안내</h2>
              <p style={franchiseDescStyle}>
                누룩 장인의 누룩소금 숙성막창을 바탕으로 한 차별화된 아이템으로
                수요가 폭증하는 BBQ 시장을 이끌어갈 점주님을 소중히 맞이합니다.
                <br />
                기초정보(이름, 연락처, 희망 지역)만 남겨주시면 가맹 상담 본부장이 
                직접 1:1 창업 컨설팅을 도와드립니다.
              </p>
              <div style={franchiseHelpBoxStyle}>
                📌 <strong>프랜차이즈 강점:</strong> 숙성막창 완제품 밀키트 공급으로 주방 무경험자도 1인 운영 가능, 테이블 회전율 150% 단축 초벌 시스템 완비.
              </div>
            </div>

            <div style={franchiseRightStyle}>
              <form onSubmit={handleFranchiseSubmit} style={franchiseFormStyle}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                  금막창 창업 관심 등록 신청
                </h3>
                
                <div style={formGroupStyle}>
                  <label style={formLabelStyle}><User size={15} /><span>점주님 성함</span></label>
                  <input
                    type="text"
                    placeholder="성함을 입력하세요"
                    value={franchiseForm.name}
                    onChange={(e) => setFranchiseForm({ ...franchiseForm, name: e.target.value })}
                    style={formInputStyle}
                    required
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={formLabelStyle}><Phone size={15} /><span>연락처 (상담 가능 번호)</span></label>
                  <input
                    type="tel"
                    placeholder="예: 010-1234-5678"
                    value={franchiseForm.phone}
                    onChange={(e) => setFranchiseForm({ ...franchiseForm, phone: e.target.value })}
                    style={formInputStyle}
                    required
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={formLabelStyle}><MapPin size={15} /><span>희망 창업 지역 (구, 군 단위 기재)</span></label>
                  <input
                    type="text"
                    placeholder="예: 대구 중구, 서울 마포구"
                    value={franchiseForm.location}
                    onChange={(e) => setFranchiseForm({ ...franchiseForm, location: e.target.value })}
                    style={formInputStyle}
                    required
                  />
                </div>

                <button type="submit" className="btn-gold" style={franchiseSubmitBtnStyle}>
                  가맹 창업 상담 신청 등록
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Event/News Detail Modal Popup */}
      {selectedEventModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="animate-fade-in" style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <button 
              onClick={() => setSelectedEventModal(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0, 0, 0, 0.5)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              ✕
            </button>

            <div style={{ width: '100%', maxHeight: '320px', overflow: 'hidden', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <DbImage 
                src={selectedEventModal.image} 
                alt={selectedEventModal.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            <div style={{ padding: '2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                게시 기간: {selectedEventModal.startDate} ~ {selectedEventModal.endDate}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1rem', lineHeight: '1.3' }}>
                {selectedEventModal.title}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {selectedEventModal.desc}
              </p>
              
              <button 
                onClick={() => setSelectedEventModal(null)}
                className="btn-gold" 
                style={{ width: '100%', marginTop: '2rem', padding: '0.8rem' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Common styles & responsive dimensions
const pageStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
};

const sectionContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 2rem',
  width: '100%'
};

const sectionTagStyle = {
  fontSize: '0.85rem',
  color: 'var(--primary-gold-hover)',
  fontWeight: '800',
  letterSpacing: '0.15rem',
  textTransform: 'uppercase',
  marginBottom: '0.75rem',
  display: 'inline-block'
};

const sectionTitleStyle = {
  fontSize: '2.4rem',
  fontWeight: '800',
  color: 'var(--text-dark)',
  textAlign: 'center',
  marginBottom: '0.75rem',
  lineHeight: '1.25'
};

const sectionDescStyle = {
  fontSize: '1rem',
  color: 'var(--text-muted)',
  textAlign: 'center',
  lineHeight: '1.6'
};

// SECTION 1: HERO STYLES (Supports YT embedded backgrounds)
const heroSectionStyle = {
  position: 'relative',
  height: '85vh',
  minHeight: '600px',
  width: '100%',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center'
};

const videoBackgroundWrapperStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 1,
  overflow: 'hidden'
};

const videoBackgroundIframeStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '100vw',
  height: '56.25vw', // 16:9 Aspect Ratio
  minHeight: '100vh',
  minWidth: '177.77vh',
  transform: 'translate(-50%, -50%) scale(1.85)',
  pointerEvents: 'none',
  objectFit: 'cover'
};

const videoBackgroundElementStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  zIndex: 1
};

const heroOverlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(31, 24, 21, 0.65)', // Deep roast espresso dimming
  zIndex: 2
};

const heroContainerStyle = {
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 2rem',
  position: 'relative',
  zIndex: 3
};

const heroContentStyle = {
  maxWidth: '950px',
  color: 'var(--text-light)'
};

const heroTagStyle = {
  color: 'var(--primary-gold)',
  fontSize: '0.9rem',
  fontWeight: '700',
  letterSpacing: '0.2rem',
  marginBottom: '1.25rem',
  display: 'block'
};

const heroTitleStyle = {
  fontSize: '3.5rem',
  fontWeight: '900',
  lineHeight: '1.25',
  marginBottom: '1.5rem',
  textShadow: '0 2px 12px rgba(0,0,0,0.4)',
};

const heroDescStyle = {
  fontSize: '1.2rem',
  color: 'var(--text-light-muted)',
  lineHeight: '1.7',
  marginBottom: '2.5rem'
};

const heroBtnGroupStyle = {
  display: 'flex',
  gap: '1rem',
  flexWrap: 'wrap'
};

const heroBtnStyle = {
  padding: '0.9rem 2.2rem',
  fontSize: '1.05rem',
  fontWeight: '600',
  borderRadius: '8px'
};

// SECTION 2: MENU SHOWCASE STYLES
const menuSectionStyle = {
  padding: '7rem 0',
  backgroundColor: 'var(--bg-primary)'
};

const menuGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '2.5rem',
  marginTop: '2rem'
};

const menuCardStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'var(--transition-smooth)',
  height: '100%'
};

const menuImageWrapperStyle = {
  width: '100%',
  position: 'relative',
  paddingTop: '100%', // 1:1 Aspect Ratio
  overflow: 'hidden'
};

const menuImgStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'var(--transition-smooth)'
};

const menuOverlayHoverStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(197, 168, 128, 0.15)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'var(--transition-smooth)',
  fontWeight: '700',
  fontSize: '0.9rem'
};

const menuCardInfoStyle = {
  padding: '1.5rem',
  textAlign: 'center'
};

const menuCardTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: '800',
  color: 'var(--text-dark)',
  marginBottom: '0.5rem'
};

const menuCardDescStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  lineHeight: '1.5',
  height: '40px',
  overflow: 'hidden'
};

// Accordion Expand Area Styles
const accordionContainerStyle = {
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '8px',
  padding: '1.25rem',
  marginTop: '0.75rem',
  position: 'relative',
  border: '1px dashed var(--primary-gold)'
};

const accordionIndicatorStyle = {
  position: 'absolute',
  top: '-7px',
  left: '50%',
  transform: 'translateX(-50%) rotate(45deg)',
  width: '12px',
  height: '12px',
  backgroundColor: 'var(--bg-secondary)',
  borderTop: '1px dashed var(--primary-gold)',
  borderLeft: '1px dashed var(--primary-gold)'
};

const accordionBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const accordionTitleStyle = {
  fontSize: '0.95rem',
  fontWeight: '800',
  color: 'var(--primary-gold-hover)',
};

const highlightBoxStyle = {
  backgroundColor: '#ffffff',
  padding: '0.75rem',
  borderRadius: '6px',
  fontSize: '0.85rem',
  color: 'var(--text-dark)',
  borderLeft: '4px solid var(--primary-gold)',
  lineHeight: '1.5'
};

// SECTION 3: BRAND STORY STYLES
const storySectionStyle = {
  padding: '7rem 0',
  backgroundColor: 'var(--bg-secondary)',
  borderTop: '1px solid var(--border-color)',
  borderBottom: '1px solid var(--border-color)',
};

const storyGridStyle = {
  display: 'flex',
  gap: '4rem',
  alignItems: 'stretch',
  flexWrap: 'wrap'
};

const storyLeftStyle = {
  flex: '1 1 500px'
};

const storyParagraphStyle = {
  fontSize: '1rem',
  lineHeight: '1.8',
  color: 'var(--text-muted)',
  marginBottom: '2rem'
};

const storyBadgeGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2.5rem'
};

const storyBadgeStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'flex-start',
  backgroundColor: '#ffffff',
  padding: '1.25rem',
  borderRadius: '12px',
  border: '1px solid var(--border-color)'
};

const storyBadgeIconStyle = {
  color: 'var(--primary-gold-hover)',
  flexShrink: 0
};

const badgeLabelStyle = {
  fontSize: '0.9rem',
  fontWeight: '800',
  color: 'var(--text-dark)',
  marginBottom: '0.25rem'
};

const badgeValueStyle = {
  fontSize: '0.95rem',
  fontWeight: '700',
  color: 'var(--accent-color)',
};

const badgeSubvalueStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  marginTop: '0.15rem'
};

const comparisonCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid var(--primary-gold)',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const comparisonTitleStyle = {
  fontSize: '1rem',
  fontWeight: '800',
  color: 'var(--text-dark)',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '0.5rem'
};

const comparisonGridStyle = {
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
  flexWrap: 'wrap'
};

const comparisonColStyle = {
  flex: 1,
  minWidth: '150px',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem'
};

const comparisonDividerStyle = {
  width: '1px',
  height: '60px',
  backgroundColor: 'var(--border-color)',
  alignSelf: 'center'
};

const comparisonFooterStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  backgroundColor: 'var(--primary-gold-light)',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px'
};

// Story Right (Sauce interactive display)
const storyRightStyle = {
  flex: '1 1 450px',
  backgroundColor: 'var(--bg-dark)',
  borderRadius: '16px',
  padding: '3rem 2.5rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: 'var(--shadow-lg)'
};

const sauceTitleStyle = {
  fontSize: '1.6rem',
  fontWeight: '800',
  color: 'var(--primary-gold)',
  textAlign: 'center',
  marginBottom: '0.5rem'
};

const saucesFlexStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1.5rem'
};

const stepCardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '1.75rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  minHeight: '170px',
  color: '#ffffff',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

const stepBadgeStyle = {
  backgroundColor: '#8c2222',
  color: '#ffffff',
  fontSize: '0.65rem',
  fontWeight: '800',
  padding: '0.2rem 0.5rem',
  borderRadius: '4px',
  letterSpacing: '0.05em',
  marginBottom: '0.75rem',
  display: 'inline-block'
};

const stepTitleStyle = {
  fontSize: '1.05rem',
  fontWeight: '800',
  color: 'var(--primary-gold-hover)',
  marginBottom: '0.5rem'
};

const stepDescStyle = {
  fontSize: '0.8rem',
  color: '#cbd5e1',
  lineHeight: '1.5',
  margin: 0
};

// SECTION 4: STORE INFO STYLES
const storeSectionStyle = {
  padding: '7rem 0',
  backgroundColor: 'var(--bg-primary)',
};

const storeTabsWrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '0.75rem',
  marginBottom: '2.5rem',
  flexWrap: 'wrap'
};

const storeTabBtnStyle = {
  padding: '0.6rem 1.5rem',
  borderRadius: '30px',
  border: '1px solid var(--border-color)',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'var(--transition-smooth)',
  outline: 'none',
  backgroundColor: '#ffffff'
};

const storeGridStyle = {
  display: 'flex',
  gap: '2.5rem',
  alignItems: 'stretch',
  flexWrap: 'wrap'
};

const storeDetailCardStyle = {
  flex: '1 1 450px',
  padding: '2.5rem',
  backgroundColor: '#ffffff',
  border: '1px solid var(--border-color)',
  borderRadius: '16px'
};

const storeTitleStyle = {
  fontSize: '1.5rem',
  fontWeight: '800',
  color: 'var(--text-dark)',
  marginBottom: '2rem',
  borderBottom: '2px solid var(--primary-gold)',
  paddingBottom: '0.75rem'
};

const storeInfoListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem'
};

const storeInfoItemStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'flex-start'
};

const storeIconStyle = {
  color: 'var(--primary-gold-hover)',
  flexShrink: 0,
  marginTop: '0.2rem'
};

const storeInfoLabelStyle = {
  fontSize: '0.8rem',
  color: 'var(--text-muted)',
  fontWeight: '600',
  display: 'block',
  marginBottom: '0.2rem'
};

const storeInfoValueStyle = {
  fontSize: '0.95rem',
  fontWeight: '700',
  color: 'var(--text-dark)',
  lineHeight: '1.4'
};

const mapCardStyle = {
  flex: '1 1 450px',
  height: '380px',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-md)',
  border: '1px solid var(--border-color)'
};

// SECTION 5: CUSTOMER REVIEWS STYLES
const reviewSectionStyle = {
  padding: '6rem 0',
  backgroundColor: 'var(--primary-gold-light)',
  borderTop: '1px solid var(--border-color)',
  borderBottom: '1px solid var(--border-color)'
};

const reviewSliderContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1.5rem',
  maxWidth: '750px',
  margin: '0 auto'
};

const sliderArrowBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--primary-gold-hover)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.5rem'
};

const reviewCardStyle = {
  flexGrow: 1,
  backgroundColor: '#ffffff',
  padding: '2.5rem',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
  textAlign: 'center',
  boxShadow: 'var(--shadow-md)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem'
};

const reviewStarRowStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '0.25rem'
};

const reviewTextStyle = {
  fontSize: '1.05rem',
  fontStyle: 'italic',
  lineHeight: '1.7',
  color: 'var(--text-dark)',
  fontWeight: '500'
};

const reviewAuthorStyle = {
  fontSize: '0.9rem',
  fontWeight: '700',
  color: 'var(--text-muted)'
};

// SECTION 6: EVENTS / NEWS STYLES
const eventSectionStyle = {
  padding: '7rem 0',
  backgroundColor: 'var(--bg-primary)'
};

const eventTabsWrapperStyle = {
  display: 'flex',
  gap: '1.5rem'
};

const eventTabBtnStyle = {
  background: 'none',
  border: 'none',
  padding: '0.5rem 0.25rem',
  fontSize: '0.95rem',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'var(--transition-smooth)'
};

const eventGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 360px))',
  gap: '2rem',
  justifyContent: 'flex-start'
};

const eventCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  padding: 0
};

const eventCardImgAreaStyle = (url) => ({
  width: '100%',
  height: '200px',
  backgroundImage: `url(${url})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  backgroundColor: 'var(--bg-secondary)'
});

const eventCardBadgeStyle = {
  position: 'absolute',
  top: '1rem',
  left: '1rem',
  backgroundColor: 'var(--accent-color)',
  color: '#ffffff',
  fontSize: '0.75rem',
  fontWeight: '800',
  padding: '0.35rem 0.75rem',
  borderRadius: '4px'
};

const eventCardBodyStyle = {
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const eventCardPeriodStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  fontWeight: '600'
};

const eventCardTitleStyle = {
  fontSize: '1.2rem',
  fontWeight: '800',
  color: 'var(--text-dark)',
};

const eventCardDescStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  lineHeight: '1.6'
};

const emptyEventsBoxStyle = {
  gridColumn: '1 / -1',
  textAlign: 'center',
  padding: '4rem 2rem',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '12px',
  color: 'var(--text-muted)',
  fontSize: '0.95rem',
  border: '1px dashed var(--border-color)'
};

// SECTION 7: FRANCHISE LIGHT CRM FORM STYLES
const franchiseSectionStyle = {
  padding: '7.5rem 0',
  backgroundColor: 'var(--bg-secondary)',
  borderTop: '1px solid var(--border-color)',
};

const franchiseGridStyle = {
  display: 'flex',
  gap: '4rem',
  alignItems: 'center',
  flexWrap: 'wrap'
};

const franchiseLeftStyle = {
  flex: '1 1 500px'
};

const franchiseTitleStyle = {
  fontSize: '2.4rem',
  fontWeight: '900',
  color: 'var(--text-dark)',
  lineHeight: '1.25',
  marginBottom: '1.5rem'
};

const franchiseDescStyle = {
  fontSize: '1rem',
  lineHeight: '1.7',
  color: 'var(--text-muted)',
  marginBottom: '2rem'
};

const franchiseHelpBoxStyle = {
  backgroundColor: 'var(--primary-gold-light)',
  padding: '1rem 1.25rem',
  borderRadius: '10px',
  fontSize: '0.9rem',
  color: 'var(--text-dark)',
  borderLeft: '4px solid var(--primary-gold)',
  lineHeight: '1.6'
};

const franchiseRightStyle = {
  flex: '1 1 400px'
};

const franchiseFormStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
  padding: '2.5rem',
  boxShadow: 'var(--shadow-lg)'
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  marginBottom: '1.25rem'
};

const formLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--text-dark)'
};

const formInputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  fontSize: '0.95rem',
  color: 'var(--text-dark)',
  outline: 'none',
  backgroundColor: '#ffffff',
  transition: 'var(--transition-smooth)'
};

const franchiseSubmitBtnStyle = {
  width: '100%',
  padding: '0.9rem',
  fontSize: '1rem',
  fontWeight: '700',
  borderRadius: '8px',
  marginTop: '0.5rem'
};

export default Home;
