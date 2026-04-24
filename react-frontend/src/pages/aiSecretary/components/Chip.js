import React from "react";
import { C } from "../styles/aiSecretaryTheme";
/* aiSecretary 전용 선택형 버튼 공통화 */

export default function Chip({ active, children, onClick }) {
  return (
    <button
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
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
    {children}
    </button>
  );
}