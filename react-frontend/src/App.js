import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import UserHome from './pages/auth/UserHome';
import { useState } from 'react';
import WelcomePage from './pages/auth/WelcomePage';
import MyRoadmap from './pages/onboarding/MyRoadmap';
import AttendanceManagement from './pages/attendance/AttendanceManagement';
import AttendanceStatistics from './pages/attendance/AttendanceStatistics';

// 화면 경로 연결
function App() {
  const [userInfo, setUserInfo] = useState(null);

  return (
    <Routes>
      {/* 1. 기본 url은 로그인 화면으로 이동 */}
      <Route path="/" element={<Navigate to="/auth/login" />} />
      {/* 2. 로그인 페이지: 로그인 정보 저장하도록 함수 전달 */}
      <Route path="/auth/login" element={<LoginPage setUserInfo={setUserInfo} />} />
      {/* 3. 환영 페이지: 로그인 정보 있을때만 접근 허용 */}
      <Route path="/auth/welcome" element={<WelcomePage userInfo={userInfo} setUserInfo={setUserInfo} />} />
      {/* 4. 유저 홈: 로그인 정보 있을때만 접근 허용 */}
      <Route path="/auth/userhome" element={<UserHome userInfo={userInfo} />} />

      <Route path="/onboarding/myroadmap" element={<MyRoadmap />} />

      {/* ------------------------------------------------------------------ */}
      {/* 근태 관리 페이지 */}
      <Route path="/attendance/management" element={<AttendanceManagement />} />

      {/* 근태 통계 페이지 */}
      <Route path="/attendance/stats" element={<AttendanceStatistics />} />
    </Routes>
  );
}

export default App;