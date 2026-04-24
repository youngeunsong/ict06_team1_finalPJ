import React from "react";
import { C } from "../styles/aiSecretaryTheme";
/* aiSecretary 전용 원문/교정 카드 UI  - 이메일 교정 */

export default function CompareCard({ title, body, accent = false }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", background: "#fff" }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, fontWeight: 800, color: accent ? C.accent : C.text }}>
        {title}
      </div>
      <div style={{ padding: 18, minHeight: 356, display: "grid", alignContent: "start", gap: 10, lineHeight: 1.9, fontSize: 14 }}>
        {body.map((line) => (
          <div key={line}>{line}</div>
        ))}
        <div
          style={{
            marginTop: 24,
            padding: 12,
            borderRadius: 10,
            background: "#F8FAFC",
            border: `1px solid ${C.border}`,
            fontSize: 12,
            color: C.sub,
          }}
        >
          첨부: 3분기 마케팅 성과 보고서_초안.pptx (10.2MB)
        </div>
      </div>
    </div>
  );
}