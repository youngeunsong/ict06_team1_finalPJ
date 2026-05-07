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
 * @ 2026.05.07    김다솜        관리자도 동일 로그인 페이지 사용하도록, 대시보드 입장 시 백엔드 세션 로그인(/admin/login-process) 브릿지 처리 추가
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from 'src/api/UserContext';
import { PATH } from 'src/constants/path';
import { containerStyle, primaryButton, secondaryButton, userInfoBox, welcomeCard, welcomeTitle } from 'src/styles/js/auth/LoginStyle';

const normalizeRole = (roleValue) => {
  if (typeof roleValue === 'string') return roleValue.toUpperCase();
  if (Array.isArray(roleValue) && roleValue.length > 0) return normalizeRole(roleValue[0]);
  if (roleValue && typeof roleValue === 'object') {
    const candidate = roleValue.roleName || roleValue.authority || roleValue.name;
    return typeof candidate === 'string' ? candidate.toUpperCase() : '';
  }
  return '';
};

function WelcomePage() {
    const navigate = useNavigate();
    const { userInfo, logout } = useUser();

    console.log("[WelcomePage] userInfo 전체:", userInfo);
    console.log("[WelcomePage] empNo:", userInfo?.empNo);
    console.log("[WelcomePage] role:", userInfo?.role);

    //로그아웃 요청 핸들러
    const handleLogout = () => {
      logout();
      navigate(PATH.AUTH.LOGIN);
    };

    // 2. 대시보드 입장 핸들러(권한별 분기)
    // 관리자 계정은 사용자용 JWT API(`/user/me`, `/user/welcome`) 조회 대상이 아니므로
    // 로그인 성공 후 role 값에 따라 인증 흐름과 이동 경로 분기
    // ROLE_ADMIN(시스템 관리자): JWT API 호출 생략하고 관리자 홈으로 이동
    // ROLE_USER(일반 사원), ROLE_TEAM_LEADER(팀 리더): accessToken/refreshToken 기반 JWT API 호출 후 사용자 홈으로 이동
    const handleEntry = () => {
      console.log("[WelcomePage] handleEntry userInfo:", userInfo);
      if(!userInfo || !userInfo.role) {
        alert('사용자 권한을 확인할 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      const userRole = normalizeRole(userInfo.role);

      if(userRole === 'ROLE_ADMIN') {
        // 시스템 관리자는 백엔드 세션 로그인 처리 후 관리자 홈으로 진입
        const serverOrigin = PATH.API.BASE.replace('/api', '');
        const bridgeRaw = sessionStorage.getItem('adminLoginBridge');

        if (bridgeRaw) {
          try {
            const bridge = JSON.parse(bridgeRaw);
            const isBridgeValid =
              bridge?.username &&
              bridge?.password &&
              Date.now() - (bridge.createdAt || 0) < 3 * 60 * 1000;

            if (isBridgeValid) {
              const form = document.createElement('form');
              form.method = 'POST';
              form.action = `${serverOrigin}/admin/login-process`;

              const usernameInput = document.createElement('input');
              usernameInput.type = 'hidden';
              usernameInput.name = 'username';
              usernameInput.value = bridge.username;

              const passwordInput = document.createElement('input');
              passwordInput.type = 'hidden';
              passwordInput.name = 'password';
              passwordInput.value = bridge.password;

              form.appendChild(usernameInput);
              form.appendChild(passwordInput);
              document.body.appendChild(form);

              sessionStorage.removeItem('adminLoginBridge');
              form.submit();
              return;
            }
          } catch (parseError) {
            console.error('adminLoginBridge 파싱 실패:', parseError);
          }
        }

        // 임시 정보가 없으면 관리자 로그인 페이지로 이동
        window.location.href = `${serverOrigin}/admin/login`;
      } else {
        // 그 외(일반 사원/팀 리더)인 경우 사용자 홈으로 이동
        navigate(PATH.AUTH.USERHOME);
      }
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
              <button onClick={handleEntry} style={primaryButton}>
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