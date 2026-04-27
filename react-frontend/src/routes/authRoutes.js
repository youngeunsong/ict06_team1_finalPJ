// routes/authRoutes.js

import React from 'react';
import { PATH } from "../constants/path";
import MyPage from 'src/pages/auth/MyPage';

// lazy loading 적용
const UserHome = React.lazy(() => import( 'src/pages/auth/UserHome'));

// DefaultLayout 내부의 AppContent 자리에 렌더링될 페이지만 명시
export const authRoutes = (userInfo, setUserInfo) => [
    // 형식 예시:  { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> },
    { path: PATH.AUTH.USERHOME, element: <UserHome userInfo={userInfo} /> },
    { path: PATH.AUTH.MYPAGE, element: <MyPage userInfo={userInfo} /> },
]; 