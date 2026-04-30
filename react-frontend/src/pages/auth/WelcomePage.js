import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'src/api/UserContext';
import { PATH } from 'src/constants/path';
import { primaryButton, secondaryButton, userInfoBox, welcomeCard, welcomeTitle } from 'src/styles/js/auth/AuthStyle';

function WelcomePage() {
    const navigate = useNavigate();
    const { userInfo, logout } = useUser();

    //로그아웃 요청 핸들러
    const handleLogout = () => {
      logout();
      navigate('/auth/login');
    };

    //userInfo 없을 경우 에러 방지용
    if(!userInfo) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <h3>정보를 불러오는 중입니다...</h3>
        </div>
      );
    }

    const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' };

    return (
        <div style={containerStyle}>
          <div style={welcomeCard}>
            <h3 style={welcomeTitle}>{userInfo.name}님, 환영합니다!</h3>

              {/* 사용자 정보 확인 영역 */}
              <div style={userInfoBox}>
                <p><strong>사번 :</strong> {userInfo.empNo || userInfo.emp_no}</p>
                <p><strong>이름 :</strong> {userInfo.name}</p>
              </div>

              {/* 대시보드 입장 버튼 */}
              {/* path에서 경로 상수 불러오기 */}
              {/* onClick={() => navigate('/auth/userhome')} */}
              <button onClick={() => navigate(PATH.AUTH.USERHOME)} style={primaryButton}>
                  대시보드 입장
              </button>
            
              {/* 로그아웃 버튼 */}
              <button onClick={handleLogout} style={secondaryButton}>
                  로그아웃
              </button>
          </div>
        </div>
      );
    }

export default WelcomePage;