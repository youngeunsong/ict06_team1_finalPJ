/* AiSecretary.js 전용 챗봇 화면 */
// src/pages/aiSecretary/screens/ChatbotScreen.js

// ChatbotScreen: 사내 지식 질의응답 화면
// 사용자가 사내 규정, 업무 절차, 운영 정보 등을 질문하면 AI가 채팅 형태로 답변

import React, { useState } from "react";
import Bubble from "../components/Bubble";
import { I, Icon } from "../constants/aiSecretaryIcons";
import { C, styles } from "../styles/aiSecretaryTheme";

export default function ChatbotScreen() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "사내 규정이나 업무 절차에 대해 무엇이든 질문해 주세요.",
      time: "오전 9:10",
    },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: input, time: "오전 9:11" },
      {
        role: "ai",
        text: "관련 정보를 사내 문서에서 검색해 답변을 준비 중입니다.",
        time: "오전 9:11",
      },
    ]);
    setInput("");
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