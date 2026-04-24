import React from "react";
/* aiSecretary 전용 작은 조각들 (Field) */

export default function Field({ label, required, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "136px 1fr", gap: 14, alignItems: "start" }}>
      <div style={{ paddingTop: 12, fontSize: 14, fontWeight: 700 }}>
        {label}
        {required && <span style={{ color: "#DC2626", marginLeft: 4 }}>*</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}