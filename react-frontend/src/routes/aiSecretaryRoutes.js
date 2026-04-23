import React from 'react';
import { PATH } from "../constants/path";

// lazy loading 적용
const AiSecretary = React.lazy(() => import( "../pages/aiSecretary/AiSecretary"));
const AiSecretaryQuickStart = React.lazy(() => import( "../pages/aiSecretary/AiSecretaryQuickStart"));
const AiSecretaryAnswerToChat = React.lazy(() => import( "../pages/aiSecretary/AiSecretaryAnswerToChat"));

// DefaultLayout 내부의 AppContent 자리에 렌더링될 페이지만 명시
export const aiSecretaryRoutes = (userInfo) => [
  // 형식: { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> },
  { path: PATH.AI.SECRETARY, element: <AiSecretary userInfo={userInfo} /> }, // AI 비서 메인
  { path: PATH.AI.SECRETARY_QUICK, element: <AiSecretaryQuickStart userInfo={userInfo} /> }, // AI 비서 빠른 시작 응답
  { path: PATH.AI.SECRETARY_CHAT, element: <AiSecretaryAnswerToChat userInfo={userInfo} /> }, // AI 비서 채팅에 응답
];