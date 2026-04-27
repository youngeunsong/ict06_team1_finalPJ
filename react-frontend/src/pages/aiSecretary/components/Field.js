/* aiSecretary 전용 작은 조각들 (Field) */
// src/pages/aiSecretary/components/Field.js
// 라벨 / 필수표시 / children 입력영역 공통 컴포넌트로 분리
// 활용: 입력 폼의 라벨 + 입력영역 배치는 StartFormScreen, KnowledgeRequestScreen 등

import React from "react";

export default function Field({ label, required, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "136px 1fr",
        gap: 14,
        alignItems: "start",
      }}
    >
      <div style={{ paddingTop: 12, fontSize: 14, fontWeight: 700 }}>
        {label}
        {required && (
          <span style={{ color: "#DC2626", marginLeft: 4 }}>*</span>
        )}
      </div>

      {/* children: 실제 input, textarea, chip 영역 */}
      <div>{children}</div>
    </div>
  );
}