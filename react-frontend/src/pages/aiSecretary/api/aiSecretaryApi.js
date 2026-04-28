import axios from 'axios';

export const createSession = (payload) =>
  axios.post("/api/ai-secretary/sessions", payload);

export const getSessionList = (empNo, sessionType) =>
  axios.get("/api/ai-secretary/sessions", {
    params: { empNo, sessionType },
  });

export const getMessages = (sessionId) =>
  axios.get(`/api/ai-secretary/sessions/${sessionId}/messages`);

export const sendMessage = (sessionId, payload) =>
  axios.post(`/api/ai-secretary/sessions/${sessionId}/messages`, payload);