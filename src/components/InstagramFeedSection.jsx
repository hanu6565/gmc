import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, ExternalLink, RefreshCw } from 'lucide-react';

function InstagramFeedSection({ instagramToken, instagramFeedUrl, customPosts }) {
  const fallbackPosts = [
    {
      id: 1,
      image: '/geummakchang_proof.jpg',
      caption: '나무꾼 햄찌가 금막창을 얻게 된 비밀 🪓✨ 전국 최초 누룩소금 숙성막창 이야기! #금막창 #나무꾼햄찌 #누룩소금막창',
      likes: 524,
      comments: 48,
      link: 'https://www.instagram.com/geummakchang/'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      caption: '📍 전국최초 누룩소금 숙성막창 금막창 대구 종로점 맑은 하늘 아래 오픈 현장! #대구막창맛집 #금막창종로점 #동성로술집',
      likes: 612,
      comments: 54,
      link: 'https://www.instagram.com/geummakchang/'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
      caption: '붉은 막이 걷히며 베일을 벗은 금막창 대구 종로 본점! 웅장한 입체 간판 공개 🚁✨ #금막창 #대구핫플 #막창다이닝',
      likes: 789,
      comments: 63,
      link: 'https://www.instagram.com/geummakchang/'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=600&auto=format&fit=crop&q=80',
      caption: '대구 종로 맛집 거리 중심에 위치한 금막창! 시원한 모퉁이 외관 전경 🏢 #대구종로맛집 #종로막창 #동성로맛집',
      likes: 495,
      comments: 37,
      link: 'https://www.instagram.com/geummakchang/'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&auto=format&fit=crop&q=80',
      caption: '삼성팬이면 무조건! 💙 라이온즈 팬들의 유쾌하고 신나는 금막창 승리 기원 단체 회식 현장 🍻 #삼성라이온즈 #금막창회식',
      likes: 842,
      comments: 91,
      link: 'https://www.instagram.com/geummakchang/'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      caption: '특허받은 누룩소금 저온숙성 공법으로 육질이 극상으로 부드러운 직화 막창 구이 ♨️ #누룩소금숙성막창 #대나무참숯초벌',
      likes: 673,
      comments: 42,
      link: 'https://www.instagram.com/geummakchang/'
    }
  ];

  const [posts, setPosts] = useState(() => {
    if (customPosts && customPosts.length > 0) return customPosts;
    return fallbackPosts;
  });
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customPosts && customPosts.length > 0) {
      setPosts(customPosts);
    }
  }, [customPosts]);

  useEffect(() => {
    const token = instagramToken || import.meta.env.VITE_INSTAGRAM_TOKEN;
    const feedUrl = instagramFeedUrl || import.meta.env.VITE_INSTAGRAM_FEED_URL;

    const fetchLiveFeed = async () => {
      // Priority 1: Direct Behold / Custom JSON Feed Endpoint
      if (feedUrl) {
        try {
          setLoading(true);
          const res = await fetch(feedUrl);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.slice(0, 6).map((item, idx) => ({
              id: item.id || idx,
              image: item.mediaUrl || item.sizes?.large?.mediaUrl || item.media_url || item.thumbnailUrl,
              caption: item.caption || '금막창 공식 인스타그램 소식 👑 #금막창',
              likes: item.likeCount || Math.floor(Math.random() * 200) + 180,
              comments: item.commentsCount || Math.floor(Math.random() * 25) + 12,
              link: item.permalink || 'https://www.instagram.com/geummakchang/'
            }));
            setPosts(mapped);
            setIsLive(true);
            return;
          }
        } catch (err) {
          console.error('Error fetching custom Instagram JSON feed:', err);
        } finally {
          setLoading(false);
        }
      }

      // Priority 2: Official Meta Graph API
      if (token) {
        try {
          setLoading(true);
          const graphUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=6&access_token=${token}`;
          const res = await fetch(graphUrl);
          const data = await res.json();
          if (data && data.data && data.data.length > 0) {
            const mapped = data.data.slice(0, 6).map((item, idx) => ({
              id: item.id || idx,
              image: item.media_type === 'VIDEO' ? (item.thumbnail_url || item.media_url) : item.media_url,
              caption: item.caption || '금막창 공식 인스타그램 소식 👑 #금막창',
              likes: Math.floor(Math.random() * 200) + 200,
              comments: Math.floor(Math.random() * 30) + 15,
              link: item.permalink || 'https://www.instagram.com/geummakchang/'
            }));
            setPosts(mapped);
            setIsLive(true);
            return;
          }
        } catch (err) {
          console.error('Error fetching Instagram Graph API:', err);
        } finally {
          setLoading(false);
        }
      }

      // Priority 3: Automatic Public Feed Fetcher for @geummakchang
      try {
        setLoading(true);
        const publicUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Frsshub.app%2Finstagram%2Fuser%2Fgeummakchang';
        const res = await fetch(publicUrl);
        const data = await res.json();
        if (data && data.items && data.items.length > 0) {
          const mapped = data.items.slice(0, 6).map((item, idx) => ({
            id: idx,
            image: item.thumbnail || item.enclosure?.link || fallbackPosts[idx % 6].image,
            caption: item.title || item.description?.replace(/<[^>]+>/g, '') || '금막창 공식 인스타그램 소식 👑 #금막창',
            likes: Math.floor(Math.random() * 150) + 250,
            comments: Math.floor(Math.random() * 20) + 15,
            link: item.link || 'https://www.instagram.com/geummakchang/'
          }));
          setPosts(mapped);
          setIsLive(true);
        }
      } catch (e) {
        // Silent fallback to curated signature posts
      } finally {
        setLoading(false);
      }
    };

    fetchLiveFeed();
  }, [instagramToken, instagramFeedUrl]);

  return (
    <section style={sectionStyle}>
      <div style={containerStyle}>
        
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={tagStyle}>INSTAGRAM FEED</span>
            {isLive && (
              <span style={{
                fontSize: '0.75rem',
                backgroundColor: '#dcfce7',
                color: '#166534',
                padding: '0.25rem 0.6rem',
                borderRadius: '12px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
                실시간 연동 중
              </span>
            )}
          </div>
          <h2 style={titleStyle}>금막창 인스타그램 소식</h2>
          <p style={subtitleStyle}>
            공식 인스타그램 <strong>@geummakchang</strong>을 팔로우하시고 금막창의 맛있는 일상과 소식을 가장 먼저 받아보세요.
          </p>
        </div>

        {/* 3x2 Grid */}
        <div style={gridStyle} className="insta-grid-responsive">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              style={cardStyle}
              className="insta-card-hover"
            >
              <img src={post.image} alt="금막창 인스타그램 게시물" style={imageStyle} />
              
              {/* Dark Hover Mask */}
              <div style={overlayStyle} className="insta-overlay">
                {/* Instagram Icon */}
                <div style={instaIconWrapperStyle}>
                  <svg 
                    viewBox="0 0 24 24" 
                    width="28" 
                    height="28" 
                    stroke="var(--primary-gold)" 
                    strokeWidth="2" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>

                {/* Caption preview */}
                <p style={captionStyle}>{post.caption}</p>

                {/* Stats */}
                <div style={statsRowStyle}>
                  <span style={statItemStyle}>
                    <Heart size={16} fill="var(--primary-gold)" color="var(--primary-gold)" />
                    <span>{post.likes}</span>
                  </span>
                  <span style={statItemStyle}>
                    <MessageCircle size={16} fill="#ffffff" color="#ffffff" />
                    <span>{post.comments}</span>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Instagram Follow Button CTA */}
        <div style={ctaWrapperStyle}>
          <a
            href="https://www.instagram.com/geummakchang/"
            target="_blank"
            rel="noopener noreferrer"
            style={ctaBtnStyle}
            className="hover-gold-grow"
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
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span>@geummakchang 인스타그램 팔로우하기</span>
            <ExternalLink size={16} />
          </a>
        </div>

      </div>
    </section>
  );
}

// Inline Styles
const sectionStyle = {
  padding: '6rem 0',
  backgroundColor: 'var(--bg-secondary)',
  borderTop: '1px solid var(--border-color)',
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 2rem',
  width: '100%',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '3.5rem',
};

const tagStyle = {
  fontSize: '0.85rem',
  color: 'var(--primary-gold-hover)',
  fontWeight: '800',
  letterSpacing: '0.15rem',
  textTransform: 'uppercase',
  marginBottom: '0.75rem',
  display: 'inline-block',
};

const titleStyle = {
  fontSize: '2.4rem',
  fontWeight: '800',
  color: 'var(--text-dark)',
  marginBottom: '0.75rem',
  lineHeight: '1.25',
};

const subtitleStyle = {
  fontSize: '0.95rem',
  color: 'var(--text-muted)',
  lineHeight: '1.6',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '1.5rem',
  marginBottom: '3rem',
};

const cardStyle = {
  position: 'relative',
  aspectRatio: '1 / 1',
  borderRadius: '16px',
  overflow: 'hidden',
  display: 'block',
  boxShadow: 'var(--shadow-md)',
  backgroundColor: 'var(--bg-dark)',
  textDecoration: 'none',
  border: '1px solid var(--border-color)',
};

const imageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.4s ease-in-out',
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(26, 20, 17, 0.78)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
  opacity: 0,
  transition: 'opacity 0.3s ease-in-out',
  backdropFilter: 'blur(2px)',
};

const instaIconWrapperStyle = {
  marginBottom: '0.75rem',
};

const captionStyle = {
  color: '#ffffff',
  fontSize: '0.85rem',
  lineHeight: '1.5',
  textAlign: 'center',
  marginBottom: '1rem',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const statsRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.25rem',
  color: '#ffffff',
  fontSize: '0.85rem',
  fontWeight: '700',
};

const statItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
};

const ctaWrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
};

const ctaBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.6rem',
  backgroundColor: '#2c221e',
  color: 'var(--primary-gold)',
  border: '1px solid var(--primary-gold)',
  padding: '0.9rem 2rem',
  borderRadius: '30px',
  fontSize: '0.95rem',
  fontWeight: '800',
  textDecoration: 'none',
  transition: 'var(--transition-smooth)',
  boxShadow: '0 4px 15px rgba(44, 34, 30, 0.2)',
};

export default InstagramFeedSection;
