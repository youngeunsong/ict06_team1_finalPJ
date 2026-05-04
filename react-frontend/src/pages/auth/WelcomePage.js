/**
 * @FileName : WelcomePage.js
 * @Description : 로그인 성공 후 진입하는 웰컴 페이지
 *                - 사용자 기본 정보 표시
 *                - 대시보드 이동 및 로그아웃 기능 제공
 * @Author : 김다솜
 * @Date : 2026. 04. 17
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.17    김다솜        최초 생성
 * @ 2026.04.30    김다솜        스타일 코드 분리(LoginStyle.js) 및 UI 정리
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'src/api/UserContext';
import { PATH } from 'src/constants/path';
import { containerStyle, primaryButton, secondaryButton, userInfoBox, welcomeCard, welcomeTitle } from 'src/styles/js/auth/LoginStyle';

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