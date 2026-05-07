/* aiSecretary > WriterScreen 화면 전용 문서 본문 섹션 */
// src/pages/aiSecretary/components/Section.js

// 문서 본문 섹션 : 1. 개요 / 2. 주요 내용 / 4. 후속 계획

import React from "react";

export default function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          marginBottom: 12,
        }}
      >
        {title}
      </div>

      <div>{children}</div>
    </div>
  );
}