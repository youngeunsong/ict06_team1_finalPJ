import React from 'react';
import { PATH } from "../constants/path";

// lazy loading 적용
const Chatbot  = React.lazy(() => import("../pages/chatbot/Chatbot"));
const ChatbotSelectMenu  = React.lazy(() => import("../pages/chatbot/ChatbotSelectMenu"));
const ChatbotSelectMenuAction  = React.lazy(() => import( "../pages/chatbot/ChatbotSelectMenuAction"));
const ChatbotWriteMessage  = React.lazy(() => import( "../pages/chatbot/ChatbotWriteMessage"));
const ChatbotMain  = React.lazy(() => import( "src/pages/chatbot/ChatbotMain"));
const ChatbotMainSelectMenu  = React.lazy(() => import( "src/pages/chatbot/ChatbotMainSelectMenu"));
const ChatbotMainMessage  = React.lazy(() => import( "src/pages/chatbot/ChatbotMainMessage"));

// DefaultLayout 내부의 AppContent 자리에 렌더링될 페이지만 명시
export const chatbotRoutes = (userInfo) => [
  // 형식: { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> },
  { path: PATH.AI.CHATBOT, element: <Chatbot userInfo={userInfo} /> }, // AI 챗봇 열기
  { path: PATH.AI.CHATBOT_MAIN, element: <ChatbotMain userInfo={userInfo} /> }, // 화면 하단에서 AI 챗봇 버튼 클릭 후 메인 페이지
  { path: PATH.AI.CHATBOT_MAIN_MENU, element: <ChatbotMainSelectMenu userInfo={userInfo} /> }, // 챗봇 메인 - 메뉴 선택 페이지
  { path: PATH.AI.CHATBOT_MAIN_MESSAGE, element: <ChatbotMainMessage userInfo={userInfo} /> }, // 챗봇 메인 - 메시지 작성 페이지

  { path: PATH.AI.CHATBOT_MENU, element: <ChatbotSelectMenu userInfo={userInfo} /> }, // AI 챗봇에서 메뉴 선택
  { path: PATH.AI.CHATBOT_RESULT, element: <ChatbotSelectMenuAction userInfo={userInfo} /> }, // AI 챗봇에서 메뉴 선택 결과
  { path: PATH.AI.CHATBOT_MESSAGE, element: <ChatbotWriteMessage userInfo={userInfo} /> }, // AI 챗봇에서 메시지 작성 페이지
];