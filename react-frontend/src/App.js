import { Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, useState } from 'react';

//1. 기존 페이지 컴포넌트
//[그룹 A] 독립 페이지(초기 진입 시 빠른 로딩을 위해 일반 import)
import LoginPage from './pages/auth/LoginPage';
import WelcomePage from './pages/auth/WelcomePage';
import Evaluation2 from './pages/evaluation/Evaluation2';

//[그룹 B] 레이아웃 및 하위 서비스 페이지(Lazy Loading 적용)
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));
const UserHome = React.lazy(() => import('./pages/auth/UserHome'));
const AIPortal = React.lazy(() => import('./pages/aiSecretary/AiSecretary'));
const MyRoadmap = React.lazy(() => import('./pages/onboarding/MyRoadmap'));
const Evaluation = React.lazy(() => import('./pages/evaluation/Evaluation'));

// 프로젝트 메인 라우터(경로 연결)
function App() {
  //로그인한 사용자 정보 전역으로 관리(예시로 useState 사용, 추후 Context API나 Redux로 확장 가능)
  //const [userInfo, setUserInfo] = useState(null);
  //시연용 계정 데이터 임시 설정
  const [userInfo, setUserInfo] = useState({
    emp_no: '20209999',
    name: '홍길동'
  });

  return (
    //Lazy Laoding 적용: 페이지 컴포넌트가 로드될 때까지 로딩 메시지 표시
    <Suspense fallback={<div className="pt-3 text-center">Loading...</div>}>
      <Routes>
        {/* 1. 초기 접속 시 로그인 페이지로 리다이렉트 */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        {/* 2. [그룹 A] 레이아웃 없는 독립 페이지(로그인, welcome) */}
        <Route path="/auth/login" element={<LoginPage setUserInfo={setUserInfo} />} />
        <Route path="/auth/welcome" element={<WelcomePage userInfo={userInfo} setUserInfo={setUserInfo} />} />

        {/* 3. [그룹 B] 사이드바/헤더 있는 메인 서비스 레이아웃 */}
        {/* 앞으로 생성할 페이지도 여기 Route만 추가하면 사이드바가 자동으로 적용됨 */}
        {/* userInfo가 있을 때만 접근 가능하도록 추후 보호 로직 추가 예정 */}
        <Route element={<DefaultLayout />}>
          {/* DefaultLayout 내부의 AppContent 자리에 아래 페이지들이 렌더링됨 */}
          <Route path="/auth/userhome" element={<UserHome userInfo={userInfo} />} />
          <Route path="/aiSecretary/ai-portal" element={<AIPortal userInfo={userInfo} />} />
          <Route path="/onboarding/myroadmap" element={<MyRoadmap userInfo={userInfo} />} />
          <Route path="/evaluation/quiz" element={<Evaluation userInfo={userInfo} />} />
          <Route path="/evaluation/evaluation" element={<Evaluation2 userInfo={userInfo} />} />
        </Route>

        {/* 4. 잘못된 경로 접근 시 처리(404 예외 처리) */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;