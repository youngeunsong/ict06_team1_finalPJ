/**
 * @FileName : Sidebar.js
 * @Description : 사내 AI 포털 전용 사이드바
 * @Author : 송혜진
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.27    송혜진        최초 생성/ BACKEND 연결
 * @ 2026.04.29    송혜진        최근 작성 목록 판단 변경
 */

import React from "react";
import { C, styles } from "../styles/aiSecretaryTheme";
import { I, Icon } from "../constants/aiSecretaryIcons";

export default function Sidebar({
  tab,
  onTabChange,
  recents,
  onRecentClick,
}) {
  const mainMenus = [
    { key: "assistant", label: "AI 비서", icon: I.robot },
    { key: "chatbot", label: "AI 챗봇", icon: I.chat },
  ];

  const extraMenus = [
    { key: "polish", label: "문장 다듬기", icon: I.mail },
    { key: "knowledge-request", label: "지식 추가 요청", icon: I.clip },
  ];

  const renderMenuButton = (item) => {
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
  };

  return (
    <aside style={styles.sidebar}>
      <div style={{ padding: 22 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 18,
            fontWeight: 900,
          }}
        >
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

        <div
          style={{
            marginTop: 22,
            display: "grid",
            gap: 8,
          }}
        >
          {mainMenus.map(renderMenuButton)}
        </div>

        <div style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: C.sub,
              padding: "0 4px 8px",
            }}
          >
            추가 기능
          </div>

          <div
            style={{
              display: "grid",
              gap: 8,
            }}
          >
            {extraMenus.map(renderMenuButton)}
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: `1px solid ${C.border}`,
          margin: "0 14px",
        }}
      />

      <div
        style={{
          padding: "18px 22px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 800,
            color: C.sub,
          }}
        >
          <Icon size={16}>{I.history}</Icon>
          최근 작성
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gap: 10,
          }}
        >
          {recents.slice(0, 3).map((doc) => (
            <button
              key={doc.id}
              onClick={() => onRecentClick(doc)}
              style={{
                ...styles.card,
                color: C.text,
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
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      lineHeight: 1.4,
                    }}
                  >
                    {doc.title}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      color: C.sub,
                      fontSize: 12,
                    }}
                  >
                    {doc.date}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}