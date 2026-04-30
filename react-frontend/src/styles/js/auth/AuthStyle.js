/**
 * @FileName : AuthStyle.js
 * @Description : 로그인 후 환영 화면 스타일 정의
 *                - 환영 카드 레이아웃 스타일
 *                - 사용자 정보 박스 스타일
 *                - 대시보드 및 로그아웃 버튼 스타일
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성 및 환영 화면 스타일 분리
 */

export const welcomeCard = {
  maxWidth: '420px',
  margin: '80px auto',
  padding: '32px',
  background: '#ffffff',
  borderRadius: '18px',
  border: '1px solid #e9ecef',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  textAlign: 'center'
};

export const welcomeTitle = {
  color: '#27ae60',
  fontWeight: 700,
  marginBottom: '20px'
};

export const userInfoBox = {
  marginBottom: '24px',
  padding: '16px',
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  textAlign: 'left'
};

export const primaryButton = {
  width: '100%',
  padding: '12px',
  border: 'none',
  borderRadius: '10px',
  backgroundColor: '#27ae60',
  color: '#ffffff',
  fontWeight: 600,
  marginBottom: '10px',
  cursor: 'pointer'
};

export const secondaryButton = {
  ...primaryButton,
  backgroundColor: '#6c757d',
  marginBottom: 0
};