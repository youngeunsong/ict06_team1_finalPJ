import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PATH } from 'src/constants/path';

function WelcomePage({ userInfo, setUserInfo }) {
    const navigate = useNavigate();

    //로그아웃 요청 핸들러
    const handleLogout = () => {
      //토큰 삭제
      localStorage.removeItem('token');
    
      //남아있는 로그인 폼 state 초기화
      setUserInfo(null);
    
      //로그아웃 후 로그인 페이지로 이동
      // navigate('/auth/login');
      navigate(PATH.AUTH.LOGIN);
    };

    //userInfo 없을 경우 에러 방지용
    if(!userInfo) return null;

    const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' };
    const cardStyle = { width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', textAlign: 'center', border: '5px solid #27ae60' };
    const buttonStyle = { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };

  return (
        <div>
            {/* 3. 로그인 성공 후 환영 페이지 */}
            <div style={containerStyle}>
              <div style={{ ...cardStyle, borderColor: '#27ae60', borderWidth: '2px', border: '5px solid #27ae60' }}>
                <h2 style={{ color: '#27ae60' }}>{userInfo.userName}님, 환영합니다!</h2>
                <div style={{ margin: '24px 0', textAlign: 'left', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                  <p style={{ margin: '5px 0' }}><strong>이름: </strong> {userInfo.userName}</p>
                  <p style={{ margin: '5px 0' }}><strong>권한: </strong> {userInfo.role}</p>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>토큰이 로컬스토리지에 저장되었습니다.</p>
                </div>

                {/* 대시보드 입장 버튼 */}
                {/* path에서 경로 상수 불러오기 */}
                {/* onClick={() => navigate('/auth/userhome')} */}
                <button                 
                  onClick={() => navigate(PATH.AUTH.USERHOME)}
                  style={{ ...buttonStyle, backgroundColor: '#27ae60', marginBottom: '10px' }}>
                    대시보드 입장
                </button>
                
                {/* 로그아웃 버튼 */}
                <button
                  onClick={handleLogout}
                  style={{ ...buttonStyle, backgroundColor: '#606770' }}>
                    로그아웃
                </button>
              </div>
            </div>
        </div>
    );
}

export default WelcomePage;