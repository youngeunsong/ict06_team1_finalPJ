import React from "react";
/* aiSecretary 전용 작은 조각들 () */

export default function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>{title}</div>
      <div dangerouslySetInnerHTML={{ __html: children }} />
    </div>
  );
}