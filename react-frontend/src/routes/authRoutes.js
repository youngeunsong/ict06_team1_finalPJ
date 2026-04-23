import React from 'react';
import { PATH } from "../constants/path";
import { element } from 'prop-types';
import LoginPage from 'src/pages/auth/LoginPage';
import WelcomePage from 'src/pages/auth/WelcomePage';
import { Navigate } from 'react-router-dom';
import UserHome from 'src/pages/auth/UserHome';

// DefaultLayout 내부의 AppContent 자리에 렌더링될 페이지만 명시
export const authRoutes = (userInfo, setUserInfo) => [
    // 형식 예시:  { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> },
    { path: PATH.AUTH.USERHOME, element: <UserHome userInfo={userInfo} /> },

]; 