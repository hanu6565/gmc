import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { FileDown, Printer, FileText, TrendingUp, DollarSign, Award } from 'lucide-react';
import { monthlySalesData, menuSalesData, genderAgeContributionData } from './mockData';

function AnalyticsTab() {
  const handleExport = (type) => {
    alert(`[리포트 내보내기 성공]\n형식: ${type}\n내용: 2026년 7월 기준 금막창 매출 및 고객 분석 리포트 다운로드가 완료되었습니다.`);
  };

  const menuColors = ['#C5A880', '#B38F5C', '#E07A5F', '#8c7e78'];

  return (
    <div style={tabContainerStyle}>
      {/* Title Header */}
      <div style={titleHeaderStyle}>
        <div style={{ flexGrow: 1 }}>
          <h2 style={tabTitleStyle}>통계 및 리포트</h2>
          <p style={tabSubtitleStyle}>매출, 메뉴 판매 성과, 고객 인구통계학적 행동 특성을 분석한 시각화 자료를 확인합니다.</p>
        </div>
        <div style={btnGroupStyle}>
          <button onClick={() => handleExport('CSV')} className="btn-outline-gold" style={actionBtnStyle}>
            <FileDown size={16} />
            <span>CSV 다운로드</span>
          </button>
          <button onClick={() => handleExport('PDF')} className="btn-gold" style={actionBtnStyle}>
            <FileText size={16} />
            <span>PDF 리포트 출력</span>
          </button>
        </div>
      </div>

      {/* Analytics Executive Summary */}
      <div className="card-premium" style={summaryCardStyle}>
        <h4 style={summaryTitleStyle}>📢 금막창 7월 영업 실적 요약 브리핑</h4>
        <p style={summaryDescStyle}>
          이번 달 누적 총 매출은 <strong>12,400,000원</strong>으로 전월 대비 <strong>8.4% 성장</strong>하였습니다.
          특히 신메뉴인 <strong style={{ color: 'var(--accent-color)' }}>'명품 통대파 돼지막창'</strong>의 판매 건수가 
          전체 매출의 30%를 돌파하며 강력한 성장을 견인하고 있습니다. 연령대별로는 <strong>30대 고객(남성 및 여성)</strong>의 
          재방문률이 가장 높았으며, 이에 따라 VIP 고객 비중이 꾸준히 늘어나는 긍정적인 신호가 나타나고 있습니다.
        </p>
      </div>

      {/* Row 1: Monthly Sales & Top Menus */}
      <div style={chartsRowStyle}>
        {/* Monthly Sales (Bar Chart) */}
        <div className="card-premium" style={chartCardStyle}>
          <div style={chartHeaderStyle}>
            <DollarSign size={18} style={{ color: 'var(--primary-gold)' }} />
            <h4 style={chartTitleStyle}>월별 매출 추이 (상반기)</h4>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySalesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip formatter={(value) => new Intl.NumberFormat('ko-KR').format(value)} />
                <Bar dataKey="sales" name="매출액(원)" fill="var(--primary-gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Menus (Horizontal Bar Chart) */}
        <div className="card-premium" style={chartCardStyle}>
          <div style={chartHeaderStyle}>
            <TrendingUp size={18} style={{ color: 'var(--accent-color)' }} />
            <h4 style={chartTitleStyle}>대표 메뉴별 누적 판매수량 (건)</h4>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={menuSalesData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'var(--text-dark)', fontWeight: 600 }} />
                <Tooltip />
                <Bar dataKey="value" name="판매량(건)" radius={[0, 4, 4, 0]}>
                  {menuSalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={menuColors[index % menuColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Customer Demographic purchasing power */}
      <div className="card-premium" style={demoCardStyle}>
        <div style={chartHeaderStyle}>
          <Award size={18} style={{ color: 'var(--primary-gold-hover)' }} />
          <h4 style={chartTitleStyle}>연령별 및 성별 구매 기여도 분석</h4>
        </div>
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={genderAgeContributionData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="age" tick={{ fontSize: 12, fill: 'var(--text-dark)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <Tooltip formatter={(value) => new Intl.NumberFormat('ko-KR').format(value) + '원'} />
              <Legend />
              <Bar dataKey="남성" fill="#c5a880" radius={[4, 4, 0, 0]} />
              <Bar dataKey="여성" fill="#e07a5f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Inline Styles
const tabContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
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
  color: 'var(--text-dark)',
};

const tabSubtitleStyle = {
  fontSize: '0.95rem',
  color: 'var(--text-muted)',
};

const btnGroupStyle = {
  display: 'flex',
  gap: '0.75rem',
};

const actionBtnStyle = {
  padding: '0.6rem 1rem',
  fontSize: '0.85rem',
  borderRadius: '8px',
};

const summaryCardStyle = {
  backgroundColor: 'var(--primary-gold-light)',
  border: '1px solid #ebdcb9',
  padding: '1.5rem',
};

const summaryTitleStyle = {
  fontSize: '1.05rem',
  fontWeight: '700',
  color: 'var(--text-dark)',
  marginBottom: '0.5rem',
};

const summaryDescStyle = {
  fontSize: '0.95rem',
  lineHeight: '1.7',
  color: 'var(--text-muted)',
};

const chartsRowStyle = {
  display: 'flex',
  gap: '1.5rem',
  flexWrap: 'wrap',
};

const chartCardStyle = {
  flex: '1 1 450px',
  border: '1px solid var(--border-color)',
};

const chartHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '1.5rem',
};

const chartTitleStyle = {
  fontSize: '1.1rem',
  fontWeight: '700',
  color: 'var(--text-dark)',
};

const demoCardStyle = {
  border: '1px solid var(--border-color)',
};

export default AnalyticsTab;
