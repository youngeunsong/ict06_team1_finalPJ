/* AiSecretary.js 전용 AI비서 홈 화면 */
// src/pages/aiSecretary/screens/AssistantHome.js

// AI 비서 안에서 자주 쓰는 기능 진입 선택 화면
// 보고서 초안 / 회의록 정리 / 결재 사유 / 메일 문구 교정 / 템플릿 추천

import React, { useState } from "react";
import AppButton from "../components/AppButton";
import { docMeta } from "../constants/aiSecretaryData";
import { I, Icon } from "../constants/aiSecretaryIcons";
import { C, styles } from "../styles/aiSecretaryTheme";

export default function AssistantHome({
  onOpenForm,
  onOpenTemplate,
  recents,
  onRecentClick,
}) {
  const quicks = [
    {
      id: "report",
      label: "보고서 초안",
      icon: I.file,
      color: "#EEF2FF",
      iconColor: "#4F46E5",
    },
    {
      id: "minutes",
      label: "회의록 정리",
      icon: I.users,
      color: "#ECFDF5",
      iconColor: "#059669",
    },
    {
      id: "approval",
      label: "결재 사유",
      icon: I.check,
      color: "#F5F3FF",
      iconColor: "#7C3AED",
    },
    {
      id: "template",
      label: "템플릿 생성",
      icon: I.spark,
      color: "#EFF6FF",
      iconColor: "#2563EB",
    },
  ];

  const PAGE_SIZE = 10;
  const [recentPage, setRecentPage] = useState(1);
  const totalRecentPages = Math.ceil(recents.length / PAGE_SIZE) || 1;

  const pagedRecents = recents.slice(
    (recentPage - 1) * PAGE_SIZE,
    recentPage * PAGE_SIZE
  );

  const typeLabelMap = {
    report: "보고서 초안",
    minutes: "회의록 정리",
    approval: "결재 사유",
    template: "템플릿 생성",
  };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, padding: 28 }}>
        <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1 }}>
          AI 비서
        </div>
        <div style={{ ...styles.sectionSub, fontSize: 16 }}>
          보고서 초안, 회의록 정리, 결재 사유, 템플릿 생성까지 문서 작성
          흐름을 한 화면에서 시작할 수 있습니다.
        </div>

        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {quicks.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "template") return onOpenTemplate();
                return onOpenForm(item.id);
              }}
              style={{
                ...styles.card,
                padding: 18,
                textAlign: "left",
                cursor: "pointer",
                minHeight: 132,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: item.color,
                  color: item.iconColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon>{item.icon}</Icon>
              </div>

              <div style={{ marginTop: 14, fontWeight: 800, fontSize: 15 }}>
                {item.label}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: C.sub,
                  lineHeight: 1.5,
                }}
              >
                {docMeta[item.id].description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...styles.card, marginTop: 18, padding: 22 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h3 style={styles.sectionTitle}>최근 작성 전체 보기</h3>
            <div style={{ ...styles.sectionSub, marginTop: 6 }}>
              최근 작성한 문서를 한 번에 확인하고 다시 이어서 작업할 수
              있습니다.
            </div>
          </div>

          <div style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>
            총 {recents.length}건 · {recentPage} / {totalRecentPages} 페이지
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.8fr 1fr 140px 120px",
              padding: "14px 18px",
              background: "#F8FAFC",
              borderBottom: `1px solid ${C.border}`,
              fontSize: 13,
              fontWeight: 800,
              color: C.sub,
            }}
          >
            <div>문서명</div>
            <div>유형</div>
            <div>최근 수정일</div>
            <div style={{ textAlign: "center" }}>바로가기</div>
          </div>

          {pagedRecents.map((doc, index) => (
            <div
              key={doc.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.8fr 1fr 140px 120px",
                padding: "14px 18px",
                borderBottom:
                  index === pagedRecents.length - 1
                    ? "none"
                    : `1px solid ${C.border}`,
                alignItems: "center",
                gap: 12,
                fontSize: 14,
              }}
            >
              <div style={{ fontWeight: 700 }}>{doc.title}</div>
              <div style={{ color: C.sub }}>
                {typeLabelMap[doc.type] || "문서"}
              </div>
              <div style={{ color: C.sub }}>{doc.date}</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <AppButton
                  variant="secondary"
                  style={{ height: 34 }}
                  onClick={() => onRecentClick(doc)}
                >
                  열기
                </AppButton>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 18,
          }}
        >
          <AppButton
            variant="secondary"
            style={{ height: 36 }}
            onClick={() => setRecentPage((prev) => Math.max(prev - 1, 1))}
            disabled={recentPage === 1}
          >
            이전
          </AppButton>

          {Array.from({ length: totalRecentPages }, (_, idx) => idx + 1).map(
            (page) => (
              <AppButton
                key={page}
                variant={recentPage === page ? "primary" : "secondary"}
                style={{ height: 36, minWidth: 36, padding: "0 12px" }}
                onClick={() => setRecentPage(page)}
              >
                {page}
              </AppButton>
            )
          )}

          <AppButton
            variant="secondary"
            style={{ height: 36 }}
            onClick={() =>
              setRecentPage((prev) => Math.min(prev + 1, totalRecentPages))
            }
            disabled={recentPage === totalRecentPages}
          >
            다음
          </AppButton>
        </div>
      </div>
    </div>
  );
}