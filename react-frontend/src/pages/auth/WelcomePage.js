import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from 'src/api/UserContext';

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
    const cardStyle = { width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', textAlign: 'center', border: '5px solid #27ae60' };
    const buttonStyle = { width: '100%', padding: '14px', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };

    return (
        <div style={containerStyle}>
          <div style={{ ...cardStyle, borderColor: '#27ae60', borderWidth: '2px', border: '5px solid #27ae60' }}>
            <h3 style={{ color: '#27ae60' }}>{userInfo.name}님, 환영합니다!</h3>

            <div style={{ margin: '24px 0', textAlign: 'left', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
              <p style={{ margin: '5px 0' }}><strong>이름: </strong> {userInfo.name}</p>
              <p style={{ margin: '5px 0' }}><strong>사번: </strong> {userInfo.empNo}</p>
              <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>성공적으로 로그인되었습니다.</p>
            </div>

            <button
              onClick={() => navigate('/auth/userhome')}
              style={{ ...buttonStyle, backgroundColor: '#27ae60', marginBottom: '10px' }}>
              대시보드 입장
            </button>

            <button
              onClick={handleLogout}
              style={{ ...buttonStyle, backgroundColor: '#606770' }}>
              로그아웃
            </button>
          </div>
        </div>
      );
    }

export default WelcomePage;