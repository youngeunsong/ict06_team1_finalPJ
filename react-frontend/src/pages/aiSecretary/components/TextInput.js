import React from "react";
import { C } from "../styles/aiSecretaryTheme";
/* aiSecretary 전용 입력창 공통화 */

export default function TextInput({ placeholder, value, onChange, textarea = false }) {
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

  // if (textarea) => textarea = true
  if (textarea) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...common, minHeight: 136, resize: "vertical", lineHeight: 1.6 }}
      />
    );
  }

  return <input value={value} onChange={onChange} placeholder={placeholder} style={common} />;
}