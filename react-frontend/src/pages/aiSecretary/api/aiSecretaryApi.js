/**
 * @FileName : aiSecretaryApi.js
 * @Description : AI 비서 / AI 챗봇 세션 및 메시지 API
 * @Author : 송혜진
 * @Date : 2026. 04. 28
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.28    송혜진        최초 생성/ BACKEND 연결
 * @ 2026.05.05    송혜진        문장 다듬기 api 추가
 * 
 */

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const unwrapApiData = (response) => {
  if (response?.data?.data !== undefined) return response.data.data;
  if (response?.data !== undefined) return response.data;
  return response;
};

// 세션 목록 조회
// 주의: CHATBOT 목록 조회에는 사용하지 말 것
export const getSessionList = (empNo, sessionType) =>
  api.get("/api/ai-secretary/sessions", {
    params: { empNo, sessionType },
  });

// 세션 생성
export const createSession = (payload) =>
  api.post("/api/ai-secretary/sessions", payload);

// CHATBOT 최근 세션 조회 또는 생성
// 백엔드 createSession 내부에서 CHATBOT이면 getOrCreateChatbotSession으로 분기된다는 전제
export const getOrCreateChatbotSession = (empNo) =>
  api.post("/api/ai-secretary/chatbot/session", null, {
    params: {
      empNo: String(empNo),
    },
  });

// 메시지 목록 조회
export const getMessages = (sessionId) =>
  api.get(`/api/ai-secretary/sessions/${sessionId}/messages`);

// 메시지 저장
export const sendMessage = (sessionId, payload) =>
  api.post(`/api/ai-secretary/sessions/${sessionId}/messages`, payload);

// 문장 다듬기 프롬프트 실행
export const correctText = (payload) =>
  api.post("/api/ai-secretary/correction", payload);

// 제미나이 연결
export const askChatbot = (payload) =>
  api.post("/api/ai-secretary/chatbot/ask", payload);

// AI 문서 초안 생성
export const createAssistantDraft = (payload) =>
  api.post("/api/ai-secretary/assistant/draft", payload);

// AI 문서 추가 수정
export const reviseAssistantDraft = (payload) =>
  api.post("/api/ai-secretary/assistant/revise", payload);
