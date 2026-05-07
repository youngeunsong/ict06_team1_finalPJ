/**
 * @FileName : HeaderStyle.js
 * @Description : 헤더 및 사용자 인터랙션 UI 스타일 정의
 *                - 헤더 네비게이션
 *                - 토스트 알림 (로그아웃 등)
 *                - 모달 (로그아웃 확인 등)
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        헤더 기본 스타일 정의
 * @ 2026.05.01    김다솜        토스트 및 모달 스타일 공통화
 */

/* =========================
   헤더 네비게이션
   ========================= */
export const headerQuickNav = {
  marginLeft: '16px',
  gap: '4px',
};

export const headerNavLink = {
  cursor: 'pointer',
  fontWeight: 500,
};

/* =========================
   토스트 알림 (로그아웃 등)
   ========================= */
export const toastStyle = {
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  background: '#6f42c1',
  color: '#ffffff'
};

export const toastBodyStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  fontWeight: 500,
};

export const toastIconStyle = {
  fontSize: '18px',
};

/* =========================
   모달 (로그아웃 확인 등)
   ========================= */

/* 모달 헤더 */
export const modalHeaderStyle = {
  borderBottom: 'none',
  justifyContent: 'center',
};

/* 모달 타이틀 */
export const modalTitleStyle = {
  fontWeight: 600,
  fontSize: '18px',
};

/* 모달 바디 */
export const modalBodyStyle = {
  textAlign: 'center',
  padding: '24px 16px',
};

/* 모달 아이콘 */
export const modalIconStyle = {
  fontSize: '2rem',
};

/* 모달 메시지 */
export const modalTextStyle = {
  marginTop: '12px',
  fontSize: '16px',
  fontWeight: 500,
};

/* 모달 서브 텍스트 */
export const modalSubTextStyle = {
  fontSize: '13px',
  color: '#6c757d',
};

/* 모달 푸터 */
export const modalFooterStyle = {
  borderTop: 'none',
  justifyContent: 'center',
  gap: '10px',
};

/* =========================
   버튼 스타일 (공통)
   ========================= */

/* 기본 버튼 */
export const buttonBaseStyle = {
  borderRadius: '8px',
  padding: '6px 14px',
  fontSize: '14px',
  fontWeight: 500,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

/* Primary 버튼 (메인 액션) */
export const buttonPrimaryStyle = {
  ...buttonBaseStyle,
  background: '#0d6efd',
  color: '#ffffff',
};

export const buttonPrimaryHover = {
  background: '#0b5ed7',
};

/* Secondary 버튼 (취소 등) */
export const buttonSecondaryStyle = {
  ...buttonBaseStyle,
  background: '#f1f3f5',
  color: '#495057',
  border: '1px solid #dee2e6',
};

export const buttonSecondaryHover = {
  background: '#e9ecef',
};

/* Danger 버튼 (삭제, 로그아웃 등) */
export const buttonDangerStyle = {
  ...buttonBaseStyle,
  background: '#dc3545',
  color: '#ffffff',
};

export const buttonDangerHover = {
  background: '#bb2d3b',
};