import { Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';

//1. 기존 페이지 컴포넌트
//[그룹 A] 독립 페이지(초기 진입 시 빠른 로딩을 위해 일반 import)
import LoginPage from './pages/auth/LoginPage';
import WelcomePage from './pages/auth/WelcomePage';
import Evaluation2 from './pages/evaluation/Evaluation2';
import ProtectedRoute from './pages/auth/ProtectedRoute';
import MyPage from './pages/auth/MyPage';
import { UserProvider } from './api/UserContext';

//[그룹 B] 레이아웃 및 하위 서비스 페이지(Lazy Loading 적용)
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));
const UserHome = React.lazy(() => import('./pages/auth/UserHome'));
const MyRoadmap = React.lazy(() => import('./pages/onboarding/MyRoadmap'));
const Evaluation = React.lazy(() => import('./pages/evaluation/Evaluation'));

// 프로젝트 메인 라우터(경로 연결)
function App() {
  //로그인 상태 확인(userInfo 객체 존재 여부)
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <UserProvider>
      {/* Lazy Laoding 적용: 페이지 컴포넌트가 로드될 때까지 로딩 메시지 표시 */}
      <Suspense fallback={<div className="pt-3 text-center">Loading...</div>}>
        <Routes>
          {/* 1. 인증 필요 없는 공용 경로 */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<LoginPage />} />

          {/* 2. [그룹 A] 로그인한 사용자만 접근 가능한 페이지 */}
          <Route element={<ProtectedRoute isAllowed={isLoggedIn} />}>
            <Route path="/auth/welcome" element={<WelcomePage />} />
            <Route element={<DefaultLayout />}>
              {/* 홈 */}
              <Route path="/auth/userhome" element={<UserHome />} />

              {/* 마이페이지 */}
              <Route path="/mypage" element={<MyPage />} />
              
              {/* 인사평가(AI온보딩 및 평가) */}
              <Route path="/onboarding/myroadmap" element={<MyRoadmap />} />
              <Route path="/evaluation/quiz" element={<Evaluation />} />
              <Route path="/evaluation/evaluation" element={<Evaluation2 />} />
            </Route>
          </Route>

          {/* 3. 예외 처리: 없는 페이지 접근 시 로그인 화면으로(404 예외 처리) */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Suspense>
    </UserProvider>
  );
}

export default App;