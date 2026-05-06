/* aiSecretary 전용 버튼 스타일 공통화 */
// src/pages/aiSecretary/components/AppButton.js
// primary / secondary 변형과 disabled 한 군데서 관리

import React from "react";
import { C } from "../styles/aiSecretaryTheme";

export default function AppButton({
  children,
  variant = "primary",
  style,
  disabled = false,
  ...props
}) {
  const base = {
    height: 42,
    borderRadius: 10,
    padding: "0 16px",
    fontSize: 14,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "0.15s ease",
    opacity: disabled ? 0.55 : 1,
  };

  const variants = {
    primary: {
      background: C.accent,
      color: "#fff",
      border: `1px solid ${C.accent}`,
    },
    secondary: {
      background: "#fff",
      color: C.text,
      border: `1px solid ${C.border}`,
    },
  };

  return (
    <button
      disabled={disabled}
      {...props}
      style={{
        ...base,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}