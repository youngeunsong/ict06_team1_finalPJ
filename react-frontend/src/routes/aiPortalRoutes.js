// routes/aiPortalRoutes.js
// 2) Path에 실제 Component를 매칭
// path.js -> routes/대분류 별 파일(여기!) -> routes/index.js -> App.js 

import React from 'react';
import { Navigate } from "react-router-dom";
import { PATH } from "../constants/path";

// lazy loading 적용
const AIPortalMain = React.lazy(() => import('src/pages/aiSecretary/AiSecretary'))

// 사내 AI 포털 메인
// 형식 예시: { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> },
export const aiPortalRoutes = (userInfo) => [
   // /ai-portal 진입 시 assistant로 리다이렉트
  {
    path: PATH.AI.ROOT,
    element: <Navigate to={PATH.AI.ASSISTANT} replace />,
  },

  // AI 비서 홈
  {
    path: PATH.AI.ASSISTANT,
    element: <AIPortalMain userInfo={userInfo} />,
  },

  // 새 문서 작성 시작
  {
    path: PATH.AI.ASSISTANT_NEW,
    element: <AIPortalMain userInfo={userInfo} />,
  },

  // 템플릿 생성
  {
    path: PATH.AI.ASSISTANT_TEMPLATE,
    element: <AIPortalMain userInfo={userInfo} />,
  },

  // 기존 문서 / 이전 대화
  {
    path: PATH.AI.ASSISTANT_DOC,
    element: <AIPortalMain userInfo={userInfo} />,
  },

  // AI 챗봇
  {
    path: PATH.AI.CHATBOT,
    element: <AIPortalMain userInfo={userInfo} />,
  },

  // 문장 다듬기
  {
    path: PATH.AI.CORRECTION,
    element: <AIPortalMain userInfo={userInfo} />,
  },

  // 지식 추가 요청
  {
    path: PATH.AI.KNOWLEDGE_REQUEST,
    element: <AIPortalMain userInfo={userInfo} />,
  },
];