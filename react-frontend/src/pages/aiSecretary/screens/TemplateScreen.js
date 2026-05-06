/**
 * @FileName : TemplateScreen.js
 * @Description : 템플릿 추천/선택 화면
 *                - 왼쪽: AI 템플릿 생성 조건 입력
 *                - 오른쪽: 추천 템플릿 목록 / AI 생성 템플릿 목록 전환 표시
 *                - 추천 템플릿 또는 AI 생성 템플릿을 선택하면 StartFormScreen으로 이동
 *                - 이후 기존 /assistant/draft API 흐름을 재사용
 * @Author : 송혜진
 * @Date : 2026. 04. 28
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    ----------------------------------------
 * @ 2026.04.28    송혜진        최초 생성
 * @ 2026.05.06    송혜진        템플릿 필터링 / 선택 조건 시작 흐름 정리
 * @ 2026.05.06    송혜진        AI 템플릿 생성 기능 프론트 확정
 */

import React, { useEffect, useMemo, useState } from "react";
import AppButton from "../components/AppButton";
import Chip from "../components/Chip";
import TextInput from "../components/TextInput";
import { docMeta, templateCards } from "../constants/aiSecretaryData";
import { I, Icon } from "../constants/aiSecretaryIcons";
import { C, styles } from "../styles/aiSecretaryTheme";

export default function TemplateScreen({ onStartTemplate, onOpenForm }) {
  /**
   * 템플릿 조건 상태
   *
   * category:
   * - 보고 / 회의록 / 결재 / 안내 / 요청 등 문서 카테고리 검색어
   *
   * dept:
   * - 영업 / 인사 / 개발 / 총무 등 부서 또는 업무 영역 검색어
   *
   * situation:
   * - 주간 업무 공유 / 교육 참가 요청 / 프로젝트 킥오프 등 상황 검색어
   *
   * tone:
   * - 문체 선택값
   * - 현재 추천 템플릿 필터에는 직접 사용하지 않는다.
   * - AI 템플릿 생성 조건 또는 추후 Gemini 프롬프트 조건으로 활용한다.
   *
   * title / paragraphs / signature:
   * - 템플릿 구성 옵션
   * - 현재는 AI 생성 템플릿 mock에 반영할 수 있는 상태값으로 유지한다.
   */
  const [filters, setFilters] = useState({
    category: "",
    dept: "",
    situation: "",
    tone: "공식적",
    title: true,
    paragraphs: true,
    signature: true,
  });

  // 오른쪽 영역 표시 모드
  // recommended: 기존 templateCards 기반 추천 템플릿 목록
  // generated: AI 템플릿 생성 버튼으로 만든 generatedTemplates 목록
  const [viewMode, setViewMode] = useState("recommended");

  // AI 생성 템플릿 목록
  const [generatedTemplates, setGeneratedTemplates] = useState([]);

  // AI 템플릿 생성 중 상태
  const [generatingTemplate, setGeneratingTemplate] = useState(false);

  // AI 템플릿 생성 오류 메시지
  const [templateError, setTemplateError] = useState("");

  // 추천 템플릿 목록 추가 요청 모달 열림 여부
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // 추천 템플릿 목록 추가 요청 내역
  // 현재 단계에서는 프론트 상태 기반 mock 데이터
  // 추후 GET /api/ai-secretary/template-request/my?empNo=... API로 대체
  const [templateRequests, setTemplateRequests] = useState([]);

  // 추천 템플릿 페이지네이션 상태
  const PAGE_SIZE = 2;
  const [currentPage, setCurrentPage] = useState(1);

  // templateCards 안전 배열
  const safeTemplateCards = Array.isArray(templateCards) ? templateCards : [];

  // 상단 탭 클릭 처리
  // report / minutes / approval: StartFormScreen으로 이동
  const handleTopTabClick = (tab) => {
    if (tab === "template") return;
    onOpenForm(tab);
  };

  // 특정 필드 묶음에 keyword가 포함되어 있는지 검사
  const includesAnyText = (targets, keyword) => {
    // [1] keyword가 비어 있으면 true 처리
    if (!keyword?.trim()) return true;

    // targets 배열을 하나의 긴 문자열로 변환하여 joined에 넣기
    const joined = targets
      .filter(Boolean)  // 1단계: 빈 값이나 잘못된 값 제거
      .join(" ")        // 2단계: 배열을 하나의 문장으로 합치기
      .toLowerCase();   // 3단계: 모두 소문자로 변환

    // includes(): 포함 여부를 판별하여 true 또는 false 반환
    // toLowerCase() : 모든 문자를 소문자로 변경
    return joined.includes(keyword.trim().toLowerCase()); 
  };

  // 추천 템플릿 필터링
  const filteredTemplateCards = useMemo(() => {
    return safeTemplateCards.filter((card) => {
  
      // 카테고리 검색 (보고, 회의록, 결재, 안내, 요청)
      const categoryMatched = includesAnyText(
        [card.category, card.title, card.tag],
        filters.category
      );

      // 부서 검색 (영업, 인사, 개발, 총무)
      const deptMatched = includesAnyText(
        [card.dept, card.tag],
        filters.dept
      );

      // 상황 검색 (주간 업무 공유, 교육 참가 요청, 킥오프, 비품 구매)
      const situationMatched = includesAnyText(
        [card.situation, card.desc, ...(card.preview || [])],
        filters.situation
      );

      return categoryMatched && deptMatched && situationMatched;
    });
  }, [
    safeTemplateCards,
    filters.category,
    filters.dept,
    filters.situation,
  ]);

  /**
   * 필터가 바뀌면 페이지를 1로 초기화한다.
   *
   * 예:
   * - 2페이지를 보고 있다가 검색 결과가 1페이지뿐이 되면
   *   currentPage가 범위를 벗어날 수 있다.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.category, filters.dept, filters.situation, filters.tone]);

  /**
   * 추천 템플릿 총 페이지 수
   *
   * 검색 결과가 0개여도 UI 안정성을 위해 최소 1페이지로 처리한다.
   */
  const totalPages = Math.max(
    1,
    Math.ceil((filteredTemplateCards?.length || 0) / PAGE_SIZE)
  );

  /**
   * 현재 페이지에 보여줄 추천 템플릿 카드 목록
   */
  const pagedTemplateCards = (filteredTemplateCards || []).slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /**
   * AI 템플릿 생성 버튼 클릭 처리
   *
   * 현재 단계:
   * - 백엔드 /assistant/template API 연결 전
   * - 우선 프론트 상태 흐름 확인을 위해 임시 AI 생성 템플릿 카드를 만든다.
   *
   * 다음 단계:
   * - 이 함수 안에서 createAssistantTemplate(payload)를 호출하도록 변경
   */
  const handleGenerateTemplate = async () => {
    if (generatingTemplate) return;

    setGeneratingTemplate(true);
    setTemplateError("");

    try {
      /**
       * mock 테스트 단계에서 로딩 상태가 보이도록 잠깐 지연
       *
       * 실제 API 연결 후에는 이 delay 제거
       */
      await new Promise((resolve) => setTimeout(resolve, 700));

      const category = filters.category || "보고";
      const dept = filters.dept || "공통";
      const situation = filters.situation || "업무 문서 작성";
      const tone = filters.tone || "공식적";

      /**
       * category 값에 따라 문서 유형 추론
       *
       * 추후 백엔드 Gemini 응답에서 type을 내려주면 그 값을 우선 사용한다.
       */
      const inferredType = category.includes("회의")
        ? "minutes"
        : category.includes("결재")
        ? "approval"
        : "report";

      /**
       * 생성 템플릿 mock 데이터
       *
       * generatedContent:
       * - StartFormScreen의 detail 값으로 넘겨 실제 /assistant/draft 초안 생성에 활용 가능
       */
      const generatedCard = {
        id: `generated-${Date.now()}`,
        type: inferredType,
        category,
        dept,
        situation,
        tone,
        title: `${situation} 템플릿`,
        tag: "AI 생성",
        desc: `${dept} 부서의 ${situation} 상황에 맞춰 생성된 AI 템플릿입니다.`,
        preview: [
          "1. 개요",
          "2. 주요 내용",
          "3. 세부 항목",
          "4. 후속 계획",
        ],
        generatedContent: [
          `${situation} 템플릿`,
          "",
          "1. 개요",
          "문서 작성 목적과 배경을 작성합니다.",
          "",
          "2. 주요 내용",
          "핵심 정보, 진행 상황, 요청 사항 등을 정리합니다.",
          "",
          "3. 세부 항목",
          "필요한 근거, 일정, 담당자, 참고 내용을 작성합니다.",
          "",
          "4. 후속 계획",
          "다음 단계와 확인이 필요한 사항을 작성합니다.",
          filters.signature ? "" : "",
          filters.signature ? "작성자: [부서/이름]" : "",
        ]
          .filter((line) => line !== null && line !== undefined)
          .join("\n"),
        templateFilters: filters,
      };

      /**
       * 새 AI 생성 템플릿을 목록 맨 앞에 추가하고,
       * 오른쪽 영역을 생성 템플릿 보기로 전환한다.
       */
      setGeneratedTemplates((prev) => [generatedCard, ...prev]);
      setViewMode("generated");
    } catch (error) {
      console.error("AI 템플릿 생성 실패", error);
      setTemplateError("AI 템플릿 생성 중 문제가 발생했습니다.");
    } finally {
      setGeneratingTemplate(false);
    }
  };

  const getRequestStatusLabel = (status) => {
    switch (status) {
      case "APPROVED":
        return "승인 완료";
      case "REJECTED":
        return "반려";
      case "CANCELED":
        return "취소됨";
      case "PENDING":
      default:
        return "검토 대기";
    }
  };

  const getRequestStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return {
          background: C.softGreen,
          color: C.success,
        };
      case "REJECTED":
        return {
          background: "#FEF2F2",
          color: "#DC2626",
        };
      case "CANCELED":
        return {
          background: "#F3F4F6",
          color: C.sub,
        };
      case "PENDING":
      default:
        return {
          background: C.accentBg,
          color: C.accent,
        };
    }
  };

  const handleRequestAddTemplate = (card) => {
    if (!card) return;

    const alreadyRequested = templateRequests.some(
      (request) => request.templateId === card.id
    );

    if (alreadyRequested) {
      setRequestModalOpen(true);
      return;
    }

    const newRequest = {
      requestId: `request-${Date.now()}`,
      templateId: card.id,
      title: card.title,
      type: card.type,
      category: card.category,
      dept: card.dept,
      situation: card.situation,
      tone: card.tone,
      status: "PENDING",
      reflected: false,
      adminComment: "",
      requestedAt: new Date().toISOString(),
    };

    setTemplateRequests((prev) => [newRequest, ...prev]);
    setRequestModalOpen(true);
  };
 
  // 템플릿 시작 처리
  // 선택한 템플릿 card를 상위 AiSecretary.js로 넘김
  const handleStartTemplate = (card) => {
    if (!card) return;

    onStartTemplate({
      ...card,

      // 현재 선택한 필터 조건도 함께 전달 (정적 추천 템플릿 / AI 생성 템플릿 모두 같은 함수로 처리)
      templateFilters: filters,
    });
  };

  return (
    <div style={styles.page}>
      {/* 상단 제목 영역 */}
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

      {/* 상단 문서 유형 탭 */}
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
              type="button"
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
              {docMeta?.[tab]?.label || tab}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "440px 1fr",
          gap: 18,
        }}
      >
        {/* 좌측: AI 생성 템플릿 조건 입력 */}
        <div style={{ ...styles.card, padding: 22 }}>
          <h3 style={styles.sectionTitle}>AI 생성 템플릿 조건</h3>

          <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
            <TextInput
              placeholder="예) 보고, 회의록, 결재, 안내, 요청 등"
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
            />

            <TextInput
              placeholder="예) 영업, 인사, 개발, 총무 등"
              value={filters.dept}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dept: e.target.value,
                }))
              }
            />

            <TextInput
              placeholder="예) 주간 업무 공유, 교육 참가 요청 등"
              value={filters.situation}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  situation: e.target.value,
                }))
              }
            />

            {/* 톤앤매너 선택 */}
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  marginBottom: 10,
                  color: C.text,
                }}
              >
                톤앤매너
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {["공식적", "친근함", "간결함"].map((tone) => (
                  <Chip
                    key={tone}
                    active={filters.tone === tone}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        tone,
                      }))
                    }
                  >
                    {tone}
                  </Chip>
                ))}
              </div>
            </div>

            {/* 템플릿 포함 옵션 */}
            {[
              [
                "title",
                "제목 포함",
                "문서의 목적을 드러내는 제목을 포함합니다.",
              ],
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
                  checked={Boolean(filters[key])}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  style={{ marginTop: 3 }}
                />

                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: C.text,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: C.sub,
                      marginTop: 4,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* AI 템플릿 생성 버튼 */}
          <AppButton
            style={{
              width: "100%",
              marginTop: 20,
              opacity: generatingTemplate ? 0.7 : 1,
              cursor: generatingTemplate ? "default" : "pointer",
            }}
            onClick={generatingTemplate ? undefined : handleGenerateTemplate}
          >
            <Icon>{I.spark}</Icon>
            {generatingTemplate ? "AI 템플릿 생성 중..." : "AI 템플릿 생성"}
          </AppButton>

          {/* 생성 오류 메시지 */}
          {templateError && (
            <div
              style={{
                marginTop: 10,
                color: "#d32f2f",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {templateError}
            </div>
          )}

          {/* 오른쪽 영역 보기 전환 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginTop: 12,
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode("generated")}
              style={{
                height: 38,
                borderRadius: 10,
                border: `1px solid ${
                  viewMode === "generated" ? C.accent : C.border
                }`,
                background: viewMode === "generated" ? C.accentBg : "#fff",
                color: viewMode === "generated" ? C.accent : C.text,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              생성 템플릿 보기
            </button>

            <button
              type="button"
              onClick={() => setViewMode("recommended")}
              style={{
                height: 38,
                borderRadius: 10,
                border: `1px solid ${
                  viewMode === "recommended" ? C.accent : C.border
                }`,
                background: viewMode === "recommended" ? C.accentBg : "#fff",
                color: viewMode === "recommended" ? C.accent : C.text,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              추천 템플릿 보기
            </button>
          </div>

          {/* 생성 템플릿 개수 안내 */}
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              color: C.sub,
              lineHeight: 1.5,
            }}
          >
            생성된 템플릿 {generatedTemplates.length}개
          </div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: C.sub,
                lineHeight: 1.5,
              }}
            >
              추가 요청 {templateRequests.length}건
            </div>

            <button
              type="button"
              onClick={() => setRequestModalOpen(true)}
              style={{
                border: "none",
                background: "transparent",
                color: C.accent,
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                padding: 0,
              }}
            >
              요청 현황 보기
            </button>
          </div>
        </div>

        {/* 우측: 추천 템플릿 / 생성 템플릿 영역 */}
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
              <h3 style={styles.sectionTitle}>
                {viewMode === "generated" ? "AI 생성 템플릿" : "추천 템플릿"}
              </h3>

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
                {viewMode === "generated"
                  ? generatedTemplates.length
                  : filteredTemplateCards.length}
              </div>
            </div>

            {viewMode === "recommended" && (
              <div style={{ fontSize: 14, color: C.sub, fontWeight: 700 }}>
                {currentPage} / {totalPages} 페이지
              </div>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                viewMode === "generated"
                  ? generatedTemplates.length === 0
                    ? "1fr"
                    : "1fr 1fr"
                  : (pagedTemplateCards?.length || 0) === 0
                  ? "1fr"
                  : "1fr 1fr",
              gap: 14,
            }}
          >
            {viewMode === "generated" ? (
              <>
                {generatedTemplates.length === 0 && (
                  <div
                    style={{
                      padding: 24,
                      border: `1px solid ${C.border}`,
                      borderRadius: 14,
                      color: C.sub,
                      textAlign: "center",
                      background: "#F8FAFC",
                    }}
                  >
                    아직 생성된 AI 템플릿이 없습니다.
                    <br />
                    왼쪽 조건을 입력하고 AI 템플릿 생성을 눌러 주세요.
                  </div>
                )}

                {generatedTemplates.map((card) => (
                  <div key={card.id} style={{ ...styles.card, padding: 18 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: C.text,
                        }}
                      >
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
                        AI 생성
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
                      {(card.preview || []).map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>

                    <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
                      <AppButton
                        variant="secondary"
                        style={{ width: "100%" }}
                        onClick={() => handleStartTemplate(card)}
                      >
                        이 템플릿으로 시작
                      </AppButton>

                      <AppButton
                        variant="secondary"
                        style={{ width: "100%" }}
                        onClick={() => handleRequestAddTemplate(card)}
                      >
                        추천 템플릿 목록에 추가 요청
                      </AppButton>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {(pagedTemplateCards?.length || 0) === 0 && (
                  <div
                    style={{
                      padding: 24,
                      border: `1px solid ${C.border}`,
                      borderRadius: 14,
                      color: C.sub,
                      textAlign: "center",
                      background: "#F8FAFC",
                    }}
                  >
                    조건에 맞는 템플릿이 없습니다. 검색 조건을 줄여 보세요.
                  </div>
                )}

                {(pagedTemplateCards || []).map((card) => (
                  <div key={card.id} style={{ ...styles.card, padding: 18 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: C.text,
                        }}
                      >
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
                      {(card.preview || []).map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>

                    <AppButton
                      variant="secondary"
                      style={{ width: "100%", marginTop: 14 }}
                      onClick={() => handleStartTemplate(card)}
                    >
                      이 템플릿으로 시작
                    </AppButton>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* 추천 템플릿 페이지네이션 */}
          {viewMode === "recommended" && (
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
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPage === 1}
              >
                이전
              </AppButton>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                (page) => (
                  <AppButton
                    key={page}
                    variant={currentPage === page ? "primary" : "secondary"}
                    style={{
                      height: 36,
                      minWidth: 36,
                      padding: "0 12px",
                    }}
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
          )}
        </div>
      </div>

      {requestModalOpen && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.45)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: 620,
            maxHeight: "80vh",
            overflowY: "auto",
            background: "#fff",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 900,
                  color: C.text,
                }}
              >
                추천 템플릿 추가 요청 현황
              </h3>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: C.sub,
                }}
              >
                AI가 생성한 템플릿을 추천 목록에 반영 요청한 내역입니다.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRequestModalOpen(false)}
              style={{
                border: "none",
                background: "transparent",
                fontSize: 24,
                color: C.sub,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          {templateRequests.length === 0 ? (
            <div
              style={{
                padding: 28,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                background: "#F8FAFC",
                color: C.sub,
                textAlign: "center",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              아직 추천 템플릿 목록에 추가 요청한 내역이 없습니다.
              <br />
              AI 생성 템플릿 카드에서 추가 요청을 진행해 주세요.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {templateRequests.map((request) => {
                const statusStyle = getRequestStatusStyle(request.status);

                return (
                  <div
                    key={request.requestId}
                    style={{
                      border: `1px solid ${C.border}`,
                      borderRadius: 14,
                      padding: 16,
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 900,
                            color: C.text,
                          }}
                        >
                          {request.title}
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 13,
                            color: C.sub,
                            lineHeight: 1.5,
                          }}
                        >
                          {request.category} · {request.dept} · {request.situation}
                        </div>
                      </div>

                      <div
                        style={{
                          height: 28,
                          padding: "0 10px",
                          borderRadius: 999,
                          display: "flex",
                          alignItems: "center",
                          fontSize: 12,
                          fontWeight: 800,
                          ...statusStyle,
                        }}
                      >
                        {getRequestStatusLabel(request.status)}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 12,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                        fontSize: 12,
                        color: C.sub,
                      }}
                    >
                      <div>
                        요청일:{" "}
                        {new Date(request.requestedAt).toLocaleString("ko-KR")}
                      </div>

                      <div>
                        반영 여부:{" "}
                        {request.reflected ? "추천 목록에 추가됨" : "미반영"}
                      </div>
                    </div>

                    {request.adminComment && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: 10,
                          borderRadius: 10,
                          background: "#F8FAFC",
                          color: C.sub,
                          fontSize: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        관리자 메모: {request.adminComment}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 18,
            }}
          >
            <AppButton
              variant="secondary"
              onClick={() => setRequestModalOpen(false)}
            >
              닫기
            </AppButton>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}