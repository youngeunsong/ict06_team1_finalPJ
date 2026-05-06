/**
 * @FileName : aiSecretaryApi.js
 * @Description : AI 비서 / AI 챗봇 세션 및 메시지 API
 * @Author : 송혜진
 * @Date : 2026. 04. 28
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.28    송혜진        최초 생성 / BACKEND 연결
 * @ 2026.05.05    송혜진        문장 다듬기 API 추가
 * @ 2026.05.06    송혜진        AI 비서 리스트 추가 API 추가
 */

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081",
});

// JWT 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 공통 응답 unwrap
// 백엔드 ApiResponse 구조: { success, message, data }
export const unwrapApiData = (response) => {
  if (response?.data?.data !== undefined) return response.data.data;
  if (response?.data !== undefined) return response.data;
  return response;
};

// -----------------------------------------------------
// 세션 관련 API
// -----------------------------------------------------

// 공통 세션 생성 (현재 CHATBOT은 /chatbot/session을 사용하므로 일반 화면에서는 미사용)
export const createSession = (payload) =>
  api.post("/api/ai-secretary/sessions", payload);

// CHATBOT 최근 세션 조회 또는 생성 (목록 없이 최근 48시간 내 단일 세션만 사용)
export const getOrCreateChatbotSession = (empNo) =>
  api.post("/api/ai-secretary/chatbot/session", null, {
    params: {
      empNo: String(empNo),
    },
  });

// AI 비서 최근 작성 목록 조회 (최근 작성 목록에는 ASSISTANT 세션만 노출)
export const getAssistantSessionList = (empNo) =>
  api.get("/api/ai-secretary/sessions", {
    params: {
      empNo: String(empNo),
      sessionType: "ASSISTANT",
    },
  });

// 공통 세션 목록 조회 (CHATBOT 목록 조회 미사용)
export const getSessionList = (empNo, sessionType) =>
  api.get("/api/ai-secretary/sessions", {
    params: {
      empNo: String(empNo),
      sessionType,
    },
  });

// 세션 내 메시지 목록 조회
export const getMessages = (sessionId) =>
  api.get(`/api/ai-secretary/sessions/${sessionId}/messages`);

// 세션 내 메시지 저장
// 현재 챗봇/AI비서 주요 흐름에서는 ask/draft/revise API가 저장까지 담당하므로
// 단독 저장용 또는 테스트용으로 유지
export const sendMessage = (sessionId, payload) =>
  api.post(`/api/ai-secretary/sessions/${sessionId}/messages`, payload);

// -----------------------------------------------------
// 챗봇 API
// -----------------------------------------------------

// Gemini 기반 챗봇 질문
export const askChatbot = (payload) =>
  api.post("/api/ai-secretary/chatbot/ask", payload);

// -----------------------------------------------------
// 문장 다듬기 API
// -----------------------------------------------------

// 문장 다듬기 프롬프트 실행
export const correctText = (payload) =>
  api.post("/api/ai-secretary/correction", payload);

// -----------------------------------------------------
// AI 비서 문서 작성 API
// -----------------------------------------------------

// AI 비서 문서 초안 생성
export const createAssistantDraft = (payload) =>
  api.post("/api/ai-secretary/assistant/draft", payload);

// AI 비서 문서 추가 수정
export const reviseAssistantDraft = (payload) =>
  api.post("/api/ai-secretary/assistant/revise", payload);