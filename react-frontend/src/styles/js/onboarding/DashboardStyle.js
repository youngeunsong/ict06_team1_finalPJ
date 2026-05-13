/**
 * @FileName : OnboardingDashboardStyle.js
 * @Description : 온보딩 대시보드 및 요약 카드 스타일 정의
 * @Author : 김다솜
 * @Date : 2026. 05. 06
 * @Modification_History
 * @
 * @ 수정일자        수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.06    김다솜        최초 생성 및 온보딩 대시보드 요약 카드 스타일 분리
 * @ 2026.05.12    김다솜        전체화면에서도 콘텐츠가 과도하게 확장되지 않도록 중앙 정렬 컨테이너 추가
 */

export const dashboardPageStyle = {
  width: '100%',
  maxWidth: '1180px',
  margin: '0 auto',
  padding: '24px',
};

export const summaryCard = {
  background: '#ffffff',
  borderRadius: '16px',
  padding: '18px',
  border: '1px solid #edf0f2',
  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
  marginBottom: '20px',
};

export const summaryHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const summaryTitle = {
  margin: 0,
  fontWeight: 700,
};

export const summaryDesc = {
  fontSize: '13px',
  color: '#868e96',
  marginTop: '4px',
};

export const summaryPercent = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#321fdb',
};

export const progressTrack = {
  marginTop: '14px',
  height: '8px',
  background: '#edf0f2',
  borderRadius: '20px',
  overflow: 'hidden',
};

export const progressFill = (percent) => ({
  width: `${percent}%`,
  height: '100%',
  background: '#321fdb',
  transition: 'width 0.3s ease',
});

export const summaryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '12px',
  marginTop: '16px',
};

export const summaryItemLabel = {
  fontSize: '12px',
  color: '#868e96',
};
