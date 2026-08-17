import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Calendar, Award, User, ShoppingBag, Landmark, X, Trash2 } from 'lucide-react';
import { supabase } from '../../utils/supabase';

function CustomerTab() {
  const [activeCrmTab, setActiveCrmTab] = useState('membership'); // 'membership' or 'franchise'
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterAge, setFilterAge] = useState('ALL');
  const [filterGrade, setFilterGrade] = useState('ALL');
  const [filterFrequency, setFilterFrequency] = useState('ALL');
  const [filterAmount, setFilterAmount] = useState('ALL');
  const [sortBy, setSortBy] = useState('registerDate'); // 'totalAmount' or 'registerDate'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Database States
  const [customers, setCustomers] = useState([]);
  const [inquiries, setInquiries] = useState([]);

  // Fetch Customers from Supabase on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('id', { ascending: true });
        if (data && data.length > 0) {
          const mapped = data.map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            gender: c.gender,
            age: c.age,
            ageGroup: c.age_group,
            grade: c.grade,
            frequency: c.frequency,
            totalAmount: c.total_amount,
            point: c.point,
            registerDate: c.register_date,
            recentPurchases: c.recent_purchases || []
          }));
          setCustomers(mapped);
        } else {
          setCustomers([]);
        }
      } catch (err) {
        console.error('Error fetching customers from Supabase:', err);
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch Inquiries from Supabase on mount and listen to updates in real time
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const { data, error } = await supabase
          .from('franchise_inquiries')
          .select('*')
          .order('id', { ascending: false });
        if (data) {
          const mapped = data.map(item => ({
            id: item.id,
            name: item.name,
            phone: item.phone,
            location: item.location,
            date: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            status: item.status
          }));
          setInquiries(mapped);
        } else {
          loadFallbackInquiries();
        }
      } catch (err) {
        console.error('Error fetching inquiries from Supabase:', err);
        loadFallbackInquiries();
      }
    };

    const loadFallbackInquiries = () => {
      const savedInquiries = localStorage.getItem('geummakchang_inquiries');
      if (savedInquiries) {
        try {
          setInquiries(JSON.parse(savedInquiries));
        } catch (e) {
          initializeDefaultInquiries();
        }
      } else {
        initializeDefaultInquiries();
      }
    };

    fetchInquiries();

    // Setup realtime subscription for inquiries table changes
    const channel = supabase
      .channel('crm-inquiries-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'franchise_inquiries' },
        () => {
          fetchInquiries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const initializeDefaultInquiries = () => {
    const defaultData = [
      { id: 1, name: '최재혁', phone: '010-9876-5432', location: '대구 수성구', date: '2026-08-14', status: '상담 대기' },
      { id: 2, name: '김지현', phone: '010-8765-4321', location: '서울 마포구', date: '2026-08-15', status: '상담 완료' },
      { id: 3, name: '박상민', phone: '010-5678-1234', location: '경기도 수원시', date: '2026-08-15', status: '연락 중' }
    ];
    setInquiries(defaultData);
    localStorage.setItem('geummakchang_inquiries', JSON.stringify(defaultData));
  };

  const handleUpdateInquiryStatus = async (id, newStatus) => {
    const updated = inquiries.map(item => item.id === id ? { ...item, status: newStatus } : item);
    setInquiries(updated);
    localStorage.setItem('geummakchang_inquiries', JSON.stringify(updated));

    try {
      const { error } = await supabase
        .from('franchise_inquiries')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating inquiry status in Supabase:', err);
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (window.confirm('해당 창업 문의 접수 내역을 삭제하시겠습니까?')) {
      const updated = inquiries.filter(item => item.id !== id);
      setInquiries(updated);
      localStorage.setItem('geummakchang_inquiries', JSON.stringify(updated));

      try {
        const { error } = await supabase
          .from('franchise_inquiries')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Error deleting inquiry from Supabase:', err);
      }
    }
  };

  // CRM Aggregate statistics
  const stats = useMemo(() => {
    const activeCustomersList = customers;
    const total = activeCustomersList.length;
    const totalAmountSum = activeCustomersList.reduce((sum, c) => sum + c.totalAmount, 0);
    const totalPointsSum = activeCustomersList.reduce((sum, c) => sum + c.point, 0);
    return { total, totalAmountSum, totalPointsSum };
  }, [customers]);

  // Filtering + Searching Logic for Members
  const filteredCustomers = useMemo(() => {
    const activeCustomersList = customers;
    return activeCustomersList.filter((customer) => {
      // Search Match
      const searchLower = search.toLowerCase();
      const matchSearch = 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(search);

      // Gender Match
      const matchGender = filterGender === 'ALL' || customer.gender === filterGender;

      // Age Match
      const matchAge = filterAge === 'ALL' || 
        (filterAge === '20대' && customer.ageGroup === '20대') ||
        (filterAge === '30대' && customer.ageGroup === '30대') ||
        (filterAge === '40대' && customer.ageGroup === '40대') ||
        (filterAge === '50대이상' && (customer.ageGroup === '50대' || customer.ageGroup === '55대 이상' || customer.ageGroup === '50대 이상' || customer.age >= 50));

      // Grade Match
      const matchGrade = filterGrade === 'ALL' || customer.grade === filterGrade;

      // Frequency Match
      let matchFreq = true;
      if (filterFrequency === '1') {
        matchFreq = customer.frequency <= 1;
      } else if (filterFrequency === '2-5') {
        matchFreq = customer.frequency >= 2 && customer.frequency <= 5;
      } else if (filterFrequency === '6') {
        matchFreq = customer.frequency >= 6;
      }

      // Amount Match
      let matchAmt = true;
      if (filterAmount === 'UNDER_10') {
        matchAmt = customer.totalAmount < 100000;
      } else if (filterAmount === '10_30') {
        matchAmt = customer.totalAmount >= 100000 && customer.totalAmount <= 300000;
      } else if (filterAmount === 'OVER_30') {
        matchAmt = customer.totalAmount > 300000;
      }

      return matchSearch && matchGender && matchAge && matchGrade && matchFreq && matchAmt;
    }).sort((a, b) => {
      if (sortBy === 'totalAmount') {
        return b.totalAmount - a.totalAmount;
      } else {
        return new Date(b.registerDate) - new Date(a.registerDate);
      }
    });
  }, [customers, search, filterGender, filterAge, filterGrade, filterFrequency, filterAmount, sortBy]);

  // Filtering + Searching Logic for Inquiries
  const filteredInquiries = useMemo(() => {
    const searchLower = search.toLowerCase();
    return inquiries.filter((inquiry) => {
      return (
        inquiry.name.toLowerCase().includes(searchLower) ||
        inquiry.phone.includes(search) ||
        inquiry.location.toLowerCase().includes(searchLower)
      );
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [search, inquiries]);

  return (
    <div style={tabContainerStyle}>
      <div style={titleHeaderStyle}>
        <h2 style={tabTitleStyle}>고객 관리 (CRM)</h2>
        <p style={tabSubtitleStyle}>등록된 고객 명단 및 창업 대기 문의 목록을 상세 조회하고 관리합니다.</p>
      </div>

      {/* CRM Database Subtabs switcher */}
      <div style={crmTabRowStyle}>
        <button 
          onClick={() => { setActiveCrmTab('membership'); setSearch(''); }}
          style={{
            ...crmTabBtnStyle,
            backgroundColor: activeCrmTab === 'membership' ? 'var(--primary-gold)' : 'transparent',
            color: activeCrmTab === 'membership' ? '#ffffff' : 'var(--text-dark)',
            border: activeCrmTab === 'membership' ? '1px solid var(--primary-gold)' : '1px solid var(--border-color)',
            fontWeight: activeCrmTab === 'membership' ? '700' : '500'
          }}
        >
          멤버십 회원 관리 ({stats.total}명)
        </button>
        <button 
          onClick={() => { setActiveCrmTab('franchise'); setSearch(''); }}
          style={{
            ...crmTabBtnStyle,
            backgroundColor: activeCrmTab === 'franchise' ? 'var(--primary-gold)' : 'transparent',
            color: activeCrmTab === 'franchise' ? '#ffffff' : 'var(--text-dark)',
            border: activeCrmTab === 'franchise' ? '1px solid var(--primary-gold)' : '1px solid var(--border-color)',
            fontWeight: activeCrmTab === 'franchise' ? '700' : '500'
          }}
        >
          창업 문의 관리 ({inquiries.length}건)
        </button>
      </div>

      {/* CRM Stats Summary */}
      {activeCrmTab === 'membership' ? (
        <div style={statsSummaryGridStyle}>
          <div className="card-premium" style={statCardStyle}>
            <div style={statLabelStyle}>전체 관리 고객</div>
            <div style={statValueStyle}>{stats.total}명</div>
          </div>
          <div className="card-premium" style={statCardStyle}>
            <div style={statLabelStyle}>누적 총 매출액</div>
            <div style={statValueStyle}>{new Intl.NumberFormat('ko-KR').format(stats.totalAmountSum)}원</div>
          </div>
          <div className="card-premium" style={statCardStyle}>
            <div style={statLabelStyle}>지급된 누적 포인트</div>
            <div style={statValueStyle}>{new Intl.NumberFormat('ko-KR').format(stats.totalPointsSum)} P</div>
          </div>
        </div>
      ) : (
        <div style={statsSummaryGridStyle}>
          <div className="card-premium" style={statCardStyle}>
            <div style={statLabelStyle}>총 창업 문의 건수</div>
            <div style={statValueStyle}>{inquiries.length}건</div>
          </div>
          <div className="card-premium" style={statCardStyle}>
            <div style={statLabelStyle}>상담 대기 건수</div>
            <div style={{ ...statValueStyle, color: 'var(--accent-color)' }}>
              {inquiries.filter(i => i.status === '상담 대기').length}건
            </div>
          </div>
          <div className="card-premium" style={statCardStyle}>
            <div style={statLabelStyle}>진행 완료 건수</div>
            <div style={{ ...statValueStyle, color: 'green' }}>
              {inquiries.filter(i => i.status === '상담 완료' || i.status === '가맹 계약').length}건
            </div>
          </div>
        </div>
      )}

      {/* Render Main CRM Content */}
      {activeCrmTab === 'membership' ? (
        <>
          {/* Search & Filters for Membership */}
          <div className="card-premium" style={filterCardStyle}>
            <div style={filterHeaderStyle}>
              <Filter size={18} style={{ color: 'var(--primary-gold)' }} />
              <h4 style={{ fontWeight: '700' }}>고객 필터링 조건 설정</h4>
            </div>

            {/* Real-time Search Box */}
            <div style={searchWrapperStyle}>
              <Search size={18} style={searchIconStyle} />
              <input
                type="text"
                placeholder="고객명, 연락처, 이메일 주소로 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchInputStyle}
              />
            </div>

            {/* Filter Selectors */}
            <div style={filterGridStyle}>
              <div style={filterGroupStyle}>
                <label style={filterLabelStyle}>성별</label>
                <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} style={selectStyle}>
                  <option value="ALL">전체 성별</option>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
              </div>

              <div style={filterGroupStyle}>
                <label style={filterLabelStyle}>연령대</label>
                <select value={filterAge} onChange={(e) => setFilterAge(e.target.value)} style={selectStyle}>
                  <option value="ALL">전체 연령</option>
                  <option value="20대">20대</option>
                  <option value="30대">30대</option>
                  <option value="40대">40대</option>
                  <option value="50대이상">50대 이상</option>
                </select>
              </div>

              <div style={filterGroupStyle}>
                <label style={filterLabelStyle}>고객 등급</label>
                <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} style={selectStyle}>
                  <option value="ALL">전체 등급</option>
                  <option value="VIP">VIP</option>
                  <option value="GOLD">GOLD</option>
                  <option value="SILVER">SILVER</option>
                  <option value="FAMILY">FAMILY</option>
                </select>
              </div>

              <div style={filterGroupStyle}>
                <label style={filterLabelStyle}>구매 빈도</label>
                <select value={filterFrequency} onChange={(e) => setFilterFrequency(e.target.value)} style={selectStyle}>
                  <option value="ALL">전체 빈도</option>
                  <option value="1">1회 이하 (이탈 위험)</option>
                  <option value="2-5">2 ~ 5회 (일반)</option>
                  <option value="6">6회 이상 (충성)</option>
                </select>
              </div>

              <div style={filterGroupStyle}>
                <label style={filterLabelStyle}>구매 금액</label>
                <select value={filterAmount} onChange={(e) => setFilterAmount(e.target.value)} style={selectStyle}>
                  <option value="ALL">전체 금액</option>
                  <option value="UNDER_10">10만원 미만</option>
                  <option value="10_30">10만원 ~ 30만원</option>
                  <option value="OVER_30">30만원 이상</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sorting Controls & List Count */}
          <div style={listMetaAreaStyle}>
            <span style={countTextStyle}>검색 결과: <strong>{filteredCustomers.length}</strong>명</span>
            
            <div style={sortGroupStyle}>
              <ArrowUpDown size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>정렬 기준:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={sortSelectStyle}>
                <option value="registerDate">최근 가입일순</option>
                <option value="totalAmount">누적 구매금액순</option>
              </select>
            </div>
          </div>

          {/* Customers Table */}
          <div className="card-premium" style={tableCardStyle}>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderRowStyle}>
                    <th style={thStyle}>이름</th>
                    <th style={thStyle}>성별/나이</th>
                    <th style={thStyle}>연락처</th>
                    <th style={thStyle}>등급</th>
                    <th style={thStyle}>방문/구매빈도</th>
                    <th style={thStyle}>누적 구매액</th>
                    <th style={thStyle}>지급 포인트</th>
                    <th style={thStyle}>가입일자</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr 
                        key={customer.id} 
                        style={tableRowStyle}
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <td style={{ ...tdStyle, fontWeight: '700', color: 'var(--primary-gold-hover)' }}>{customer.name}</td>
                        <td style={tdStyle}>{customer.gender} ({customer.age}세)</td>
                        <td style={tdStyle}>{customer.phone}</td>
                        <td style={tdStyle}><span style={getBadgeStyle(customer.grade)}>{customer.grade}</span></td>
                        <td style={tdStyle}>{customer.frequency}회</td>
                        <td style={{ ...tdStyle, fontWeight: '700' }}>{new Intl.NumberFormat('ko-KR').format(customer.totalAmount)}원</td>
                        <td style={tdStyle}>{new Intl.NumberFormat('ko-KR').format(customer.point)} P</td>
                        <td style={tdStyle}>{customer.registerDate}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ ...tdStyle, textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        일치하는 고객 데이터가 없습니다. 필터링 조건을 다시 확인해 주세요.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Search Box for Franchise Inquiries */}
          <div className="card-premium" style={filterCardStyle}>
            <div style={filterHeaderStyle}>
              <Filter size={18} style={{ color: 'var(--primary-gold)' }} />
              <h4 style={{ fontWeight: '700' }}>창업 문의 실시간 검색</h4>
            </div>
            
            <div style={searchWrapperStyle}>
              <Search size={18} style={searchIconStyle} />
              <input
                type="text"
                placeholder="신청자명, 연락처, 희망 지역으로 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchInputStyle}
              />
            </div>
          </div>

          <div style={listMetaAreaStyle}>
            <span style={countTextStyle}>검색 결과: <strong>{filteredInquiries.length}</strong>건</span>
          </div>

          {/* Franchise Table */}
          <div className="card-premium" style={tableCardStyle}>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderRowStyle}>
                    <th style={thStyle}>신청자명</th>
                    <th style={thStyle}>연락처</th>
                    <th style={thStyle}>희망 창업 지역</th>
                    <th style={thStyle}>접수일자</th>
                    <th style={thStyle}>상담 상태</th>
                    <th style={thStyle}>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.length > 0 ? (
                    filteredInquiries.map((inquiry) => (
                      <tr key={inquiry.id} style={tableRowStyle}>
                        <td style={{ ...tdStyle, fontWeight: '700' }}>{inquiry.name}</td>
                        <td style={tdStyle}>{inquiry.phone}</td>
                        <td style={{ ...tdStyle, fontWeight: '600' }}>{inquiry.location}</td>
                        <td style={tdStyle}>{inquiry.date}</td>
                        <td style={tdStyle}>
                          <select 
                            value={inquiry.status}
                            onChange={(e) => handleUpdateInquiryStatus(inquiry.id, e.target.value)}
                            style={{
                              ...selectStyle,
                              padding: '0.35rem 0.5rem',
                              fontSize: '0.85rem',
                              borderColor: inquiry.status === '상담 대기' ? 'var(--accent-color)' : 'var(--border-color)',
                              color: inquiry.status === '상담 대기' ? 'var(--accent-color)' : 'var(--text-dark)',
                              fontWeight: '600'
                            }}
                          >
                            <option value="상담 대기">상담 대기</option>
                            <option value="연락 중">연락 중</option>
                            <option value="상담 완료">상담 완료</option>
                            <option value="가맹 계약">가맹 계약 완료</option>
                          </select>
                        </td>
                        <td style={tdStyle}>
                          <button 
                            onClick={() => handleDeleteInquiry(inquiry.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#ef4444'
                            }}
                            title="삭제"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ ...tdStyle, textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        접수된 창업 문의가 없거나 검색 조건과 일치하는 항목이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle} className="animate-fade-in">
            <button style={modalCloseBtnStyle} onClick={() => setSelectedCustomer(null)}>
              <X size={20} />
            </button>

            {/* Profile Header */}
            <div style={modalHeaderStyle}>
              <div style={avatarStyle}>
                <User size={30} style={{ color: 'var(--primary-gold-hover)' }} />
              </div>
              <div>
                <h3 style={modalNameStyle}>{selectedCustomer.name}</h3>
                <p style={modalEmailStyle}>{selectedCustomer.email}</p>
                <div style={modalBadgeRowStyle}>
                  <span style={getBadgeStyle(selectedCustomer.grade)}>{selectedCustomer.grade}</span>
                  <span style={genderAgeBadgeStyle}>{selectedCustomer.gender} | {selectedCustomer.age}세</span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div style={modalStatsGridStyle}>
              <div style={modalStatItemStyle}>
                <ShoppingBag size={18} style={modalIconStyle} />
                <div>
                  <span style={modalStatLabelStyle}>총 구매 빈도</span>
                  <p style={modalStatValueStyle}>{selectedCustomer.frequency}회</p>
                </div>
              </div>

              <div style={modalStatItemStyle}>
                <Landmark size={18} style={modalIconStyle} />
                <div>
                  <span style={modalStatLabelStyle}>누적 결제금액</span>
                  <p style={modalStatValueStyle}>{new Intl.NumberFormat('ko-KR').format(selectedCustomer.totalAmount)}원</p>
                </div>
              </div>

              <div style={modalStatItemStyle}>
                <Award size={18} style={modalIconStyle} />
                <div>
                  <span style={modalStatLabelStyle}>지급 포인트</span>
                  <p style={modalStatValueStyle}>{new Intl.NumberFormat('ko-KR').format(selectedCustomer.point)} P</p>
                </div>
              </div>

              <div style={modalStatItemStyle}>
                <Calendar size={18} style={modalIconStyle} />
                <div>
                  <span style={modalStatLabelStyle}>최초 가입일자</span>
                  <p style={modalStatValueStyle}>{selectedCustomer.registerDate}</p>
                </div>
              </div>
            </div>

            {/* Order Logs */}
            <div style={orderLogsSectionStyle}>
              <h4 style={orderLogsTitleStyle}>최근 구매 / 예약 이력</h4>
              <div style={orderLogsListStyle}>
                {selectedCustomer.recentPurchases && selectedCustomer.recentPurchases.length > 0 ? (
                  selectedCustomer.recentPurchases.map((purchase, idx) => (
                    <div key={idx} style={orderLogItemStyle}>
                      <div style={orderLogDateStyle}>{purchase.date}</div>
                      <div style={orderLogDetailStyle}>
                        <div style={orderLogMenuStyle}>{purchase.menu}</div>
                        <div style={orderLogAmountStyle}>{new Intl.NumberFormat('ko-KR').format(purchase.amount)}원</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={emptyLogsStyle}>최근 구매 이력이 없습니다.</div>
                )}
              </div>
            </div>

            <div style={modalFooterStyle}>
              <button 
                onClick={() => alert('Supabase 멤버십 등급 조정 및 회원 정보 수정 기능 연동 예정')} 
                className="btn-gold" 
                style={modalActionBtnStyle}
              >
                회원 정보 수정
              </button>
              <button 
                onClick={() => setSelectedCustomer(null)} 
                className="btn-dark" 
                style={modalActionBtnStyle}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
const getBadgeStyle = (grade) => {
  const base = {
    padding: '0.25rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    display: 'inline-block',
  };
  switch (grade) {
    case 'VIP':
      return { ...base, backgroundColor: '#fef3c7', color: '#b45309' };
    case 'GOLD':
      return { ...base, backgroundColor: '#fef9c3', color: '#a16207' };
    case 'SILVER':
      return { ...base, backgroundColor: '#f3f4f6', color: '#4b5563' };
    default:
      return { ...base, backgroundColor: '#ffedd5', color: '#c2410c' };
  }
};

// Inline Styles
const tabContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
};

const titleHeaderStyle = {
  marginBottom: '0.5rem',
};

const tabTitleStyle = {
  fontSize: '1.75rem',
  fontWeight: '800',
  color: 'var(--text-dark)',
};

const tabSubtitleStyle = {
  fontSize: '0.95rem',
  color: 'var(--text-muted)',
};

const statsSummaryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1.5rem',
};

const statCardStyle = {
  padding: '1.5rem',
  border: '1px solid var(--border-color)',
};

const statLabelStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-muted)',
  marginBottom: '0.5rem',
};

const statValueStyle = {
  fontSize: '1.8rem',
  fontWeight: '800',
  color: 'var(--text-dark)',
};

const filterCardStyle = {
  padding: '2rem',
  border: '1px solid var(--border-color)',
};

const filterHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '1.5rem',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '0.75rem',
};

const searchWrapperStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1.5rem',
};

const searchIconStyle = {
  position: 'absolute',
  left: '1rem',
  color: 'var(--text-muted)',
};

const searchInputStyle = {
  width: '100%',
  padding: '0.8rem 1rem 0.8rem 2.75rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  outline: 'none',
  fontSize: '0.95rem',
  color: 'var(--text-dark)',
  transition: 'var(--transition-smooth)',
  ':focus': {
    borderColor: 'var(--primary-gold)',
  }
};

const filterGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1.25rem',
};

const filterGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const filterLabelStyle = {
  fontSize: '0.8rem',
  fontWeight: '600',
  color: 'var(--text-muted)',
};

const selectStyle = {
  padding: '0.6rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  fontSize: '0.9rem',
  outline: 'none',
  color: 'var(--text-dark)',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
};

const listMetaAreaStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1rem',
  margin: '0.5rem 0 -0.5rem 0',
};

const countTextStyle = {
  fontSize: '0.95rem',
  color: 'var(--text-dark)',
};

const sortGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const sortSelectStyle = {
  border: 'none',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--primary-gold-hover)',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  outline: 'none',
};

const tableCardStyle = {
  padding: '0.5rem',
  border: '1px solid var(--border-color)',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
};

const tableHeaderRowStyle = {
  borderBottom: '2px solid var(--border-color)',
};

const thStyle = {
  padding: '0.85rem 1rem',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-muted)',
  backgroundColor: 'var(--bg-secondary)',
};

const tableRowStyle = {
  borderBottom: '1px solid var(--border-color)',
  cursor: 'pointer',
  transition: 'var(--transition-smooth)',
  ':hover': {
    backgroundColor: 'var(--bg-secondary)',
  }
};

const tdStyle = {
  padding: '1rem',
  fontSize: '0.9rem',
  color: 'var(--text-dark)',
};

// Modal Details Styles
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(44, 34, 30, 0.65)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1001,
};

const modalContentStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
  width: '100%',
  maxWidth: '550px',
  padding: '2.5rem',
  boxShadow: 'var(--shadow-lg)',
  position: 'relative',
};

const modalCloseBtnStyle = {
  position: 'absolute',
  top: '1.25rem',
  right: '1.25rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  padding: '0.25rem',
};

const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.25rem',
  marginBottom: '2rem',
};

const avatarStyle = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-gold-light)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalNameStyle = {
  fontSize: '1.5rem',
  fontWeight: '800',
  color: 'var(--text-dark)',
  marginBottom: '0.2rem',
};

const modalEmailStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  marginBottom: '0.5rem',
};

const modalBadgeRowStyle = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
};

const genderAgeBadgeStyle = {
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'var(--text-muted)',
  backgroundColor: 'var(--bg-secondary)',
  padding: '0.25rem 0.6rem',
  borderRadius: '20px',
};

const modalStatsGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1.25rem',
  marginBottom: '2rem',
  padding: '1.25rem',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: '12px',
};

const modalStatItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const modalIconStyle = {
  color: 'var(--primary-gold-hover)',
};

const modalStatLabelStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  display: 'block',
};

const modalStatValueStyle = {
  fontSize: '0.95rem',
  fontWeight: '700',
  color: 'var(--text-dark)',
};

const orderLogsSectionStyle = {
  marginBottom: '2rem',
};

const orderLogsTitleStyle = {
  fontSize: '1rem',
  fontWeight: '700',
  color: 'var(--text-dark)',
  marginBottom: '1rem',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '0.5rem',
};

const orderLogsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  maxHeight: '180px',
  overflowY: 'auto',
};

const orderLogItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  padding: '0.75rem',
  borderRadius: '6px',
  backgroundColor: 'var(--bg-primary)',
  border: '1px solid var(--border-color)',
};

const orderLogDateStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
};

const orderLogDetailStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const orderLogMenuStyle = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: 'var(--text-dark)',
};

const orderLogAmountStyle = {
  fontSize: '0.9rem',
  fontWeight: '700',
  color: 'var(--accent-color)',
};

const emptyLogsStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  textAlign: 'center',
  padding: '1rem',
};

const modalFooterStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.75rem',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '1.25rem',
};

const modalActionBtnStyle = {
  padding: '0.6rem 1.2rem',
  fontSize: '0.9rem',
};

const crmTabRowStyle = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '1rem',
};

const crmTabBtnStyle = {
  padding: '0.6rem 1.25rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'var(--transition-smooth)',
  outline: 'none',
};

export default CustomerTab;
