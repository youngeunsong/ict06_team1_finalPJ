import React from "react";
import AppButton from "./AppButton";
import { C, Icon, styles } from "../styles/aiSecretaryTheme";
import { I } from "../constants/aiSecretaryIcons";
/* aiSecretary 전용 작은 조각들 (사이드바) */

export default function Sidebar({ tab, onTabChange, onNewDoc, recents, onRecentClick }) {
  return (
    <aside style={styles.sidebar}>
      <div style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 18, fontWeight: 900 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              background: "linear-gradient(180deg, #5BA8FF 0%, #2563EB 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
            }}
          >
            A
          </div>
          사내 AI 포털
        </div>

        <AppButton onClick={onNewDoc} style={{ width: "100%", marginTop: 22, height: 48 }}>
          <Icon>{I.plus}</Icon>
          새 대화 시작
        </AppButton>

        <div style={{ marginTop: 22, display: "grid", gap: 8 }}>
          {[
            { key: "assistant", label: "AI 비서", icon: I.robot },
            { key: "chatbot", label: "AI 챗봇", icon: I.chat },
          ].map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                style={{
                  height: 52,
                  borderRadius: 12,
                  border: "none",
                  background: active ? C.accentBg : "transparent",
                  color: active ? C.accent : C.text,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0 16px",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: active ? 800 : 600,
                }}
              >
                <Icon>{item.icon}</Icon>
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, margin: "0 14px" }} />

      <div style={{ padding: "18px 22px", flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, color: C.sub }}>
          <Icon size={16}>{I.history}</Icon>
          최근 작성
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          {recents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onRecentClick(doc)}
              style={{
                ...styles.card,
                textAlign: "left",
                padding: 14,
                cursor: "pointer",
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: C.softBlue,
                    color: C.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon>{I.file}</Icon>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4 }}>{doc.title}</div>
                  <div style={{ marginTop: 6, color: C.sub, fontSize: 12 }}>{doc.date}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 18, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "linear-gradient(180deg, #E5E7EB 0%, #CBD5E1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}
          >
            김
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>김지훈 대리</div>
            <div style={{ fontSize: 12, color: C.sub }}>전략기획팀 · 온라인</div>
          </div>
          <Icon>{I.down}</Icon>
        </div>
      </div>
    </aside>
  );
}