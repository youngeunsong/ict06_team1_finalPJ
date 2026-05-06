/* aiSecretary > 문장 다듬기 화면 전용 섹션 */
// src/pages/aiSecretary/components/OptionGroup.js

// 활용: 문장 다듬기 화면 => 톤 / 수정 강도 / 길이 조절
// label + options + selected + onChange 패턴

import React from "react";
import Chip from "./Chip";

export default function OptionGroup({
  label,
  options,
  selected,
  onChange,
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          marginBottom: 10,
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {options.map((option) => (
          <Chip
            key={option}
            active={selected === option}
            onClick={() => onChange(option)}
          >
            {option}
          </Chip>
        ))}
      </div>
    </div>
  );
}