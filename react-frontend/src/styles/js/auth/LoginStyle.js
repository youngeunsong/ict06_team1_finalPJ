/**
 * @FileName : LoginStyle.js
 * @Description : 로그인 및 환영 화면 스타일 정의
 *                - 로그인 컨테이너 및 카드 레이아웃
 *                - 입력 필드 및 버튼 스타일
 *                - 환영 카드 레이아웃 스타일
 *                - 사용자 정보 박스 스타일
 *                - 대시보드 및 로그아웃 버튼 스타일
 * @Author : 김다솜
 * @Date : 2026. 04. 30
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.30    김다솜        최초 생성 및 LoginPage 스타일 분리
 */

// 로그인 화면
export const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    margin: 0,
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
};

export const cardStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    textAlign: 'center'
}

export const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    boxSizing: 'border-box',
    outline: 'none'
};

export const loginButton = (isLoading) => ({
  width: '100%',
  padding: '14px',
  backgroundColor: isLoading ? '#a5c9e1' : '#1877f2',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: isLoading ? 'not-allowed' : 'pointer',
});

// 환영 화면
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