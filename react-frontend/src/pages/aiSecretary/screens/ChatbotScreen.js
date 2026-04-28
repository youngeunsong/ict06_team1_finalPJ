/* AiSecretary.js 전용 챗봇 화면 */
// src/pages/aiSecretary/screens/ChatbotScreen.js

// ChatbotScreen: 사내 지식 질의응답 화면
// 사용자가 사내 규정, 업무 절차, 운영 정보 등을 질문하면 AI가 채팅 형태로 답변

import React, { useState } from "react";
import Bubble from "../components/Bubble";
import { I, Icon } from "../constants/aiSecretaryIcons";
import { C, styles } from "../styles/aiSecretaryTheme";

export default function ChatbotScreen() {

  // 내 쳇봇 세션 목록
  const [sessions, setSessions] = useState([]);

  // 지금 열려 있는 대화방 ID
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // 현재 대화방의 메시지들
  const [messages, setMessages] = useState([]);

  // 입력창 값
  const [input, setInput] = useState("");

  // 세션 목록/ 초기 세션 생성 중 로딩
  const [loadingSessions, setLoadingSessions] = useState(false);

  // 메시지 목록 조회 중 로딩
  const [loadingMessages, setLoadingMessages] = useState(false);

  // 메시지 전송 중 중복 클릭 방지
  const [sending, setSending] = useState(false);

  // API 실패 시 표시할 에러 메시지
  const [error, setError] = useState("");

  // 메시지 포맷 맵핑 : 백엔드 - 프론트엔드 매핑
  const mapMessageToBubble = (message) => ({
    role: message.role === "USER" ? "user" : "ai",
    text: message.content,
    time: formatMessageTime(message.createdAt),
  });

  // 시간 포맷 맵핑
  const formatMessageTime = (value) => {
    if (!value) return "";
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, color: C.sub, fontWeight: 700 }}>
          AI 챗봇
        </div>
        <h1
          style={{
            margin: "6px 0 0",
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: -1,
          }}
        >
          사내 지식 검색
        </h1>
      </div>

      <div
        style={{
          ...styles.card,
          padding: 20,
          minHeight: 720,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "grid",
            gap: 16,
            alignContent: "start",
          }}
        >
          {messages.map((msg, idx) => (
            <Bubble
              key={`${msg.time}-${idx}`}
              role={msg.role}
              text={msg.text}
              time={msg.time}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 12,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="질문을 입력하세요..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 14,
            }}
          />
          <button
            type="button"
            onClick={send}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "none",
              background: C.accent,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <Icon color="#fff">{I.send}</Icon>
          </button>
        </div>
      </div>
    </div>
  );
}