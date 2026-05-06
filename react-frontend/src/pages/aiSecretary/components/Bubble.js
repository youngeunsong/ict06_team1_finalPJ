/* aiSecretary 전용 채팅 말풍선 공통화 */
// src/pages/aiSecretary/components/Bubble.js

// 활용: WriterScreen, CorrectionScreen, ChatbotScreen
// 역할(role)에 따라 정렬, 배경색, borderRadius만 변경

import React from "react";
import { C } from "../styles/aiSecretaryTheme";

export default function Bubble({ role, text, time }) {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div style={{ maxWidth: "88%" }}>
        <div
          style={{
            background: isUser ? C.accentBg : "#fff",
            border: `1px solid ${isUser ? "#C7DBFF" : C.border}`,
            borderRadius: isUser
              ? "16px 16px 6px 16px"
              : "16px 16px 16px 6px",
            padding: "14px 14px",
            whiteSpace: "pre-line",
            lineHeight: 1.6,
            fontSize: 14,
          }}
        >
          {text}
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: C.muted,
          }}
        >
          {time}
        </div>
      </div>
    </div>
  );
}