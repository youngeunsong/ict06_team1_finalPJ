import React from "react";
import { C } from "../styles/aiSecretaryTheme";
/* aiSecretary 전용 버튼 스타일 공통화 */

export default function AppButton({ children, variant = "primary", style, ...props }) {
  const base = {
    height: 42,
    borderRadius: 10,
    padding: "0 16px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "0.15s ease",
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
    ghost: {
      background: "transparent",
      color: C.sub,
      border: "1px solid transparent",
    },
  };

  return (
    <button {...props} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}