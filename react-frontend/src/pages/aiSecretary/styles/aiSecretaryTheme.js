import React from "react";
/* aiSecretary 전용 CSS */

export const C = {
  bg: "#F4F7FB",
  sidebar: "#FFFFFF",
  card: "#FFFFFF",
  border: "#D9E2EC",
  text: "#111827",
  sub: "#6B7280",
  muted: "#94A3B8",
  accent: "#2563EB",
  accentBg: "#EAF2FF",
  success: "#16A34A",
  softBlue: "#F1F6FF",
  softGreen: "#ECFDF3",
};

export const styles = {
  app: {
    display: "flex",
    minHeight: "100vh",
    background: C.bg,
    fontFamily:
      "Pretendard, Apple SD Gothic Neo, Noto Sans KR, sans-serif",
    color: C.text,
  },
  sidebar: {
    width: 272,
    background: C.sidebar,
    borderRight: `1px solid ${C.border}`,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  main: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  page: {
    padding: 28,
  },
  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 18,
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 800,
    margin: 0,
  },
  sectionSub: {
    fontSize: 13,
    color: C.sub,
    marginTop: 6,
    lineHeight: 1.5,
  },
};

export function Icon({ children, size = 18, color = "currentColor" }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        flexShrink: 0,
      }}
    >
    {children}
    </span>
  );
}