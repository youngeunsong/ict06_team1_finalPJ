/* aiSecretary 전용 입력창 공통화 */
// src/pages/aiSecretary/components/TextInput.js

import React from "react";
import { C } from "../styles/aiSecretaryTheme";

export default function TextInput({
  placeholder,
  value,
  onChange,
  textarea = false,
}) {
  const common = {
    width: "100%",
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    outline: "none",
    background: "#fff",
    color: C.text,
    fontSize: 14,
    padding: "12px 14px",
    boxSizing: "border-box",
  };

  // textarea와 input의 기본 스타일은 거의 같고,
  // 높이/resize/lineHeight 정도만 다르므로 하나의 컴포넌트 안에서 분기 처리
  if (textarea) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          ...common,
          minHeight: 136,
          resize: "vertical",
          lineHeight: 1.6,
        }}
      />
    );
  }

  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={common}
    />
  );
}