/* aiSecretary 전용 선택형 버튼 공통화 */
// src/pages/aiSecretary/components/Chip.js

// Chip 버튼 활용: 문서 작성 시작 화면, 템플릿 생성 화면, 문장 다듬기 옵션 화면 등

import React from "react";
import { C } from "../styles/aiSecretaryTheme";

export default function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 38,
        padding: "0 14px",
        borderRadius: 10,
        border: `1px solid ${active ? C.accent : C.border}`,
        background: active ? C.accentBg : "#fff",
        color: active ? C.accent : C.text,
        fontSize: 14,
        fontWeight: active ? 700 : 500,
        cursor: onClick ? "pointer" : "default",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {children}
    </button>
  );
}