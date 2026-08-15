import React from 'react';
import { Users, TrendingUp, CreditCard, Award, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { mockCustomers, monthlySalesData } from './mockData';

function DashboardTab() {
  // Aggregate mock database values dynamically
  const totalCustomers = mockCustomers.length;
  const totalRevenue = mockCustomers.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalVisits = mockCustomers.reduce((sum, c) => sum + c.frequency, 0);

  // Group by grades dynamically
  const gradeGroup = mockCustomers.reduce((acc, c) => {
    acc[c.grade] = (acc[c.grade] || 0) + 1;
    return acc;
  }, {});

  const gradeChartData = [
    { name: 'VIP 등급', value: gradeGroup['VIP'] || 0, color: '#C5A880' },
    { name: 'GOLD 등급', value: gradeGroup['GOLD'] || 0, color: '#D4AF37' },
    { name: 'SILVER 등급', value: gradeGroup['SILVER'] || 0, color: '#8c7e78' },
    { name: 'FAMILY 등급', value: gradeGroup['FAMILY'] || 0, color: '#E07A5F' }
  ];

  // Sort by registration date for new customers
  const recentCustomers = [...mockCustomers]
    .sort((a, b) => new Date(b.registerDate) - new Date(a.registerDate))
    .slice(0, 5);

  const formattedRevenue = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(totalRevenue);

  return (
    <div style={tabContainerStyle}>
      <div style={titleHeaderStyle}>
        <h2 style={tabTitleStyle}>대시보드 개요</h2>
        <p style={tabSubtitleStyle}>금막창 매장의 전체 운영 현황과 실시간 주요 지표를 시각화합니다.</p>
      </div>

      {/* KPI Cards Grid */}
      <div style={cardGridStyle}>
        <div className="card-premium" style={kpiCardStyle}>
          <div style={cardIconStyle('var(--primary-gold-light)', 'var(--primary-gold-hover)')}>
            <Users size={22} />
          </div>
          <div>
            <p style={kpiLabelStyle}>전체 회원수</p>
            <h3 style={kpiValueStyle}>{totalCustomers}명</h3>
            <p style={kpiMetaStyle}>전주 대비 <span style={{ color: 'green', fontWeight: 600 }}>+12% ▲</span></p>
          </div>
        </div>

        <div className="card-premium" style={kpiCardStyle}>
          <div style={cardIconStyle('#fef3c7', '#d97706')}>
            <TrendingUp size={22} />
          </div>
          <div>
            <p style={kpiLabelStyle}>누적 매출액</p>
            <h3 style={kpiValueStyle}>{formattedRevenue}</h3>
            <p style={kpiMetaStyle}>전월 대비 <span style={{ color: 'green', fontWeight: 600 }}>+8.4% ▲</span></p>
          </div>
        </div>

        <div className="card-premium" style={kpiCardStyle}>
          <div style={cardIconStyle('#fee2e2', '#dc2626')}>
            <CreditCard size={22} />
          </div>
          <div>
            <p style={kpiLabelStyle}>총 누적거래</p>
            <h3 style={kpiValueStyle}>{totalVisits}건</h3>
            <p style={kpiMetaStyle}>평균 객단가: ₩ 319,266</p>
          </div>
        </div>

        <div className="card-premium" style={kpiCardStyle}>
          <div style={cardIconStyle('#e0f2fe', '#0284c7')}>
            <Award size={22} />
          </div>
          <div>
            <p style={kpiLabelStyle}>VIP 회원 비중</p>
            <h3 style={kpiValueStyle}>
              {(( (gradeGroup['VIP'] || 0) / totalCustomers) * 100).toFixed(0)}%
            </h3>
            <p style={kpiMetaStyle}>우수 등급 유지율: 94%</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Table Row */}
      <div style={chartsRowStyle}>
        {/* Left Area Chart */}
        <div className="card-premium" style={chartCardStyle}>
          <h4 style={chartTitleStyle}>주간 방문객 및 매출 흐름</h4>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-gold)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary-gold)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip formatter={(value) => new Intl.NumberFormat('ko-KR').format(value)} />
                <Area type="monotone" dataKey="sales" name="매출(원)" stroke="var(--primary-gold)" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Pie Chart */}
        <div className="card-premium" style={donutCardStyle}>
          <h4 style={chartTitleStyle}>고객 등급별 분포</h4>
          <div style={{ height: '220px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gradeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={donutSummaryStyle}>
            {gradeChartData.map((g, i) => (
              <div key={i} style={donutSummaryItemStyle}>
                <span style={{ ...colorIndicatorStyle, backgroundColor: g.color }}></span>
                <span style={donutSummaryLabelStyle}>{g.name}</span>
                <span style={donutSummaryValueStyle}>{g.value}명</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Table: New Customers list */}
      <div className="card-premium" style={tableSectionStyle}>
        <div style={tableHeaderStyle}>
          <h4 style={chartTitleStyle}>신규 고객 가입 현황</h4>
          <span style={realtimeTagStyle}>실시간</span>
        </div>
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>이름</th>
                <th style={thStyle}>연락처</th>
                <th style={thStyle}>고객등급</th>
                <th style={thStyle}>누적 구매금액</th>
                <th style={thStyle}>가입일자</th>
              </tr>
            </thead>
            <tbody>
              {recentCustomers.map((customer) => (
                <tr key={customer.id} style={tableRowStyle}>
                  <td style={{ ...tdStyle, fontWeight: '600' }}>{customer.name}</td>
                  <td style={tdStyle}>{customer.phone}</td>
                  <td style={tdStyle}>
                    <span style={getBadgeStyle(customer.grade)}>{customer.grade}</span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: '700' }}>
                    {new Intl.NumberFormat('ko-KR').format(customer.totalAmount)}원
                  </td>
                  <td style={tdStyle}>{customer.registerDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper function for badges
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

const cardGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1.5rem',
};

const kpiCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.25rem',
  border: '1px solid var(--border-color)',
};

const cardIconStyle = (bg, color) => ({
  width: '50px',
  height: '50px',
  borderRadius: '12px',
  backgroundColor: bg,
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const kpiLabelStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-muted)',
  marginBottom: '0.25rem',
};

const kpiValueStyle = {
  fontSize: '1.5rem',
  fontWeight: '800',
  color: 'var(--text-dark)',
  lineHeight: '1.2',
};

const kpiMetaStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  marginTop: '0.35rem',
};

const chartsRowStyle = {
  display: 'flex',
  gap: '1.5rem',
  flexWrap: 'wrap',
};

const chartCardStyle = {
  flex: '2 1 500px',
  border: '1px solid var(--border-color)',
};

const donutCardStyle = {
  flex: '1 1 300px',
  border: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
};

const chartTitleStyle = {
  fontSize: '1.1rem',
  fontWeight: '700',
  color: 'var(--text-dark)',
  marginBottom: '1.25rem',
};

const donutSummaryStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.75rem',
  marginTop: '1.5rem',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '1rem',
};

const donutSummaryItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.8rem',
};

const colorIndicatorStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
};

const donutSummaryLabelStyle = {
  color: 'var(--text-muted)',
};

const donutSummaryValueStyle = {
  fontWeight: '700',
  color: 'var(--text-dark)',
  marginLeft: 'auto',
};

const tableSectionStyle = {
  border: '1px solid var(--border-color)',
};

const tableHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
};

const realtimeTagStyle = {
  backgroundColor: '#fef2f2',
  color: '#dc2626',
  padding: '0.2rem 0.6rem',
  borderRadius: '6px',
  fontSize: '0.7rem',
  fontWeight: '700',
  animation: 'pulse 2s infinite',
};

const tableContainerStyle = {
  overflowX: 'auto',
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
  padding: '0.75rem 1rem',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-muted)',
  backgroundColor: 'var(--bg-secondary)',
};

const tableRowStyle = {
  borderBottom: '1px solid var(--border-color)',
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

export default DashboardTab;
