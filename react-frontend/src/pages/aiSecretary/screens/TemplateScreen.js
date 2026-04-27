/* AiSecretary.js 전용 템플릿 생성 화면 */
// src/pages/aiSecretary/screens/TemplateScreen.js

// TemplateScreen: 템플릿 추천/선택 화면 => (AI 문서 생성 작업 화면 이전 단계)
// 1) 사용자가 문서 카테고리, 상황, 톤앤매너 등의 조건을 선택
// 2) 관리자가 미리 등록한 템플릿을 추천받고 선택해서 시작

import React, { useState } from "react";
import AppButton from "../components/AppButton";
import Chip from "../components/Chip";
import TextInput from "../components/TextInput";
import { docMeta, templateCards } from "../constants/aiSecretaryData";
import { I, Icon } from "../constants/aiSecretaryIcons";
import { C, styles } from "../styles/aiSecretaryTheme";

export default function TemplateScreen({ onStartTemplate, onOpenForm }) {
  const [filters, setFilters] = useState({
    category: "",
    dept: "",
    situation: "",
    tone: "공식적",
    title: true,
    paragraphs: true,
    signature: true,
  });

  const handleTopTabClick = (tab) => {
    if (tab === "template") return;
    onOpenForm(tab);
  };

  const PAGE_SIZE = 2;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(templateCards.length / PAGE_SIZE);

  const pagedTemplateCards = templateCards.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 16, color: C.sub, fontWeight: 700 }}>
          AI 비서
        </div>
        <h1
          style={{
            margin: "6px 0 0",
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: -1,
          }}
        >
          템플릿 생성
        </h1>
        <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 16 }}>
          반복적으로 쓰는 업무 문서를 빠르게 시작합니다.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        {["report", "minutes", "approval", "template"].map((tab) => {
          const active = tab === "template";
          const icon =
            tab === "report"
              ? I.file
              : tab === "minutes"
              ? I.users
              : tab === "approval"
              ? I.check
              : I.spark;

          return (
            <button
              key={tab}
              onClick={() => handleTopTabClick(tab)}
              style={{
                ...styles.card,
                minHeight: 92,
                padding: 18,
                border: `1px solid ${active ? C.accent : C.border}`,
                background: active ? C.accentBg : "#fff",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 15,
                fontWeight: 800,
                color: active ? C.accent : C.text,
                cursor: active ? "default" : "pointer",
                textAlign: "left",
              }}
            >
              <Icon>{icon}</Icon>
              {docMeta[tab].label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          ...styles.card,
          padding: 18,
          marginBottom: 18,
          background: "#F7FAFF",
        }}
      >
        <div style={{ color: C.accent, fontWeight: 900, fontSize: 15 }}>
          템플릿 생성은 0→1 초안이 아니라, 반복 문서의 기본 뼈대를 만드는
          기능입니다.
        </div>
        <div style={{ marginTop: 8, color: C.sub, fontSize: 14 }}>
          문서 카테고리, 상황, 톤앤매너 등을 선택하면 재사용 가능한 템플릿을
          추천해 드립니다.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "440px 1fr",
          gap: 18,
        }}
      >
        <div style={{ ...styles.card, padding: 22 }}>
          <h3 style={styles.sectionTitle}>템플릿 조건 선택</h3>

          <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
            <TextInput
              placeholder="예) 보고, 안내, 요청, 공지, 인사 등"
              value={filters.category}
              onChange={(e) =>
                setFilters((p) => ({ ...p, category: e.target.value }))
              }
            />

            <TextInput
              placeholder="부서를 선택하세요"
              value={filters.dept}
              onChange={(e) =>
                setFilters((p) => ({ ...p, dept: e.target.value }))
              }
            />

            <TextInput
              placeholder="예) 주간 업무 공유, 외부 협조 요청 등"
              value={filters.situation}
              onChange={(e) =>
                setFilters((p) => ({ ...p, situation: e.target.value }))
              }
            />

            <div>
              <div
                style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}
              >
                톤앤매너
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {["공식적", "친근함", "간결함"].map((tone) => (
                  <Chip
                    key={tone}
                    active={filters.tone === tone}
                    onClick={() => setFilters((p) => ({ ...p, tone }))}
                  >
                    {tone}
                  </Chip>
                ))}
              </div>
            </div>

            {[
              ["title", "제목 포함", "문서의 목적을 드러내는 제목을 포함합니다."],
              [
                "paragraphs",
                "기본 문단 포함",
                "도입, 본문, 마무리 등 기본 문단 구성을 포함합니다.",
              ],
              [
                "signature",
                "서명 포함",
                "작성자/부서/연락처 등 서명 영역을 포함합니다.",
              ],
            ].map(([key, label, desc]) => (
              <label
                key={key}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={filters[key]}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, [key]: e.target.checked }))
                  }
                  style={{ marginTop: 3 }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{label}</div>
                  <div
                    style={{ fontSize: 13, color: C.sub, marginTop: 4 }}
                  >
                    {desc}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <AppButton style={{ width: "100%", marginTop: 20 }}>
            <Icon>{I.spark}</Icon>
            템플릿 생성
          </AppButton>
        </div>

        <div style={{ ...styles.card, padding: 22 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h3 style={styles.sectionTitle}>추천 템플릿</h3>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: C.accentBg,
                  color: C.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {templateCards.length}
              </div>
            </div>

            <div style={{ fontSize: 14, color: C.sub, fontWeight: 700 }}>
              {currentPage} / {totalPages} 페이지
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            {pagedTemplateCards.map((card) => (
              <div key={card.id} style={{ ...styles.card, padding: 18 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 900 }}>
                    {card.title}
                  </div>
                  <div
                    style={{
                      height: 28,
                      padding: "0 10px",
                      borderRadius: 999,
                      background: C.accentBg,
                      color: C.accent,
                      display: "flex",
                      alignItems: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {card.tag}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 14,
                    color: C.sub,
                    lineHeight: 1.6,
                  }}
                >
                  {card.desc}
                </div>

                <div
                  style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 10,
                    background: "#F8FAFC",
                    border: `1px solid ${C.border}`,
                    fontSize: 13,
                    color: C.sub,
                    lineHeight: 1.6,
                  }}
                >
                  {card.preview.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>

                <AppButton
                  variant="secondary"
                  style={{ width: "100%", marginTop: 14 }}
                  onClick={() => onStartTemplate(card)}
                >
                  이 템플릿으로 시작
                </AppButton>
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
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              이전
            </AppButton>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
              (page) => (
                <AppButton
                  key={page}
                  variant={currentPage === page ? "primary" : "secondary"}
                  style={{ height: 36, minWidth: 36, padding: "0 12px" }}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </AppButton>
              )
            )}

            <AppButton
              variant="secondary"
              style={{ height: 36 }}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              다음
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
}