import React from "react";
import Chip from "./Chip";
/* aiSecretary 전용 작은 조각들 () */

export default function OptionGroup({ label, options, selected, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map((option) => (
          <Chip key={option} active={selected === option} onClick={() => onChange(option)}>
            {option}
          </Chip>
        ))}
      </div>
    </div>
  );
}