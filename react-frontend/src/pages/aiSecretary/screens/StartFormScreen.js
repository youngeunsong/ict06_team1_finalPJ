/* AiSecretary.js 전용 문서 작성 시작 화면 */
// src/pages/aiSecretary/screens/StartFormScreen.js

/*
  StartFormScreen 역할
  --------------------------------------------------
  1. AI 비서 문서 작성을 시작하기 전 입력값을 받는 화면
  2. 문서 유형(REPORT / MINUTES / APPROVAL)에 따라 입력 라벨과 placeholder를 변경
  3. 사용자가 입력한 formData를 상위 AiSecretary.js로 전달
  4. AI 초안 생성 버튼 클릭 시 onGenerateDraft 실행

  문서 유형 기준
  --------------------------------------------------
  백엔드 / DB / 프론트 문서 유형값은 대문자로 통일한다.

  - REPORT   : 보고서 초안
  - MINUTES  : 회의록 정리
  - APPROVAL : 결재 사유

  주의
  --------------------------------------------------
  - template은 문서 유형이 아니라 템플릿 생성 화면 탭이다.
  - 따라서 template은 소문자로 유지한다.
*/

import React from "react";
import AppButton from "../components/AppButton";
import Chip from "../components/Chip";
import Field from "../components/Field";
import TextInput from "../components/TextInput";
import { docMeta } from "../constants/aiSecretaryData";
import { I, Icon } from "../constants/aiSecretaryIcons";
import { C, styles } from "../styles/aiSecretaryTheme";

export default function StartFormScreen({
  formType, // 현재 문서 유형: REPORT / MINUTES / APPROVAL
  formData, // 입력값
  onChangeFormType, // 상단 문서 유형 탭 변경
  onChangeFormData, // 입력값 변경
  onGenerateDraft, // AI 초안 생성 버튼 클릭 시 실행
  onOpenTemplate, // 템플릿 탭 클릭 시 실행
  generating = false, // AI 초안 생성 중 여부
  error = "", // 입력 검증/API 오류 메시지
}) {
  /**
   * 상단 탭 목록
   *
   * REPORT / MINUTES / APPROVAL:
   * - 문서 유형
   *
   * template:
   * - 문서 유형이 아니라 TemplateScreen으로 이동하는 화면 탭
   */
  const tabs = ["REPORT", "MINUTES", "APPROVAL", "template"];

  /**
   * formType 안전 보정
   *
   * 혹시 잘못된 값이 들어오면 REPORT 기준으로 fallback한다.
   */
  const safeFormType =
    formType === "REPORT" || formType === "MINUTES" || formType === "APPROVAL"
      ? formType
      : "REPORT";

  /**
   * formData 안전 보정
   *
   * 상위 상태가 아직 초기화되지 않았거나 일부 필드가 undefined여도
   * 화면이 깨지지 않도록 기본값을 지정한다.
   */
  const safeFormData = {
    title: formData?.title || "",
    purpose: formData?.purpose || "",
    audience: formData?.audience || "",
    targets: Array.isArray(formData?.targets) ? formData.targets : [],
    detail: formData?.detail || "",
    amount: formData?.amount || "",
  };

  /**
   * 문서 유형별 입력 필드 메타 정보
   */
  const baseFields = {
    REPORT: {
      title: "문서 제목",
      titlePlaceholder: "예) 3분기 마케팅 성과 보고서 초안",

      purpose: "작성 목적",
      purposePlaceholder:
        "예) 3분기 마케팅 활동 성과를 정리하고 향후 전략 방향을 제시하기 위함",

      target: "대상 독자",
      targetPlaceholder: "예) 마케팅팀 팀장 및 유관 부서 담당자",

      detail: "핵심 내용",
      detailPlaceholder:
        "주요 이슈, 배경, 현황, 분석, 시사점, 제안 등을 자유롭게 작성해 주세요.",

      amount: "원하는 분량",
      amountPlaceholder: "예) A4 3~5페이지 분량",
    },

    MINUTES: {
      title: "회의 제목",
      titlePlaceholder: "예) 4월 주간 운영회의 회의록",

      purpose: "회의 목적",
      purposePlaceholder: "예) 주간 진행 현황 공유 및 이슈 정리",

      target: "참석자/공유 대상",
      targetPlaceholder: "예) 전략기획팀, 디자인팀, 개발팀",

      detail: "회의 내용",
      detailPlaceholder:
        "회의 발언 내용, 안건, 의사결정 사항, 액션아이템을 입력해 주세요.",

      amount: "정리 방식",
      amountPlaceholder: "예) 결정사항 중심 / 액션아이템 중심",
    },

    APPROVAL: {
      title: "결재 제목",
      titlePlaceholder: "예) 외부 교육 참가 결재 요청",

      purpose: "요청 배경",
      purposePlaceholder:
        "예) 프로젝트 수행 역량 강화를 위한 외부 교육 참가 필요",

      target: "결재 대상",
      targetPlaceholder: "예) 팀장, 부서장",

      detail: "결재 사유",
      detailPlaceholder:
        "필요성, 예상 효과, 일정, 비용 등을 포함해 주세요.",

      amount: "강조 포인트",
      amountPlaceholder: "예) 비용 대비 효과 / 긴급성 / 업무 연관성",
    },
  };

  const f = baseFields[safeFormType] || baseFields.REPORT;

  /**
   * 상단 탭 클릭 처리
   *
   * template:
   * - TemplateScreen으로 이동
   *
   * REPORT / MINUTES / APPROVAL:
   * - 해당 문서 작성 폼으로 이동
   */
  const handleTopTabClick = (tab) => {
    if (tab === "template") {
      onOpenTemplate();
      return;
    }

    onChangeFormType(tab);
  };

  /**
   * 정리 대상 / 보고 대상 / 결재 라인 chip 목록
   */
  const targetOptions =
    safeFormType === "MINUTES"
      ? ["참석자 공유", "의사결정자", "액션아이템 중심"]
      : safeFormType === "APPROVAL"
      ? ["팀장", "부서장", "전사 공유"]
      : ["팀장", "부서장", "전사 공유"];

  /**
   * 현재 문서 유형에 따라 중간 필드 라벨 변경
   */
  const targetGroupLabel =
    safeFormType === "MINUTES"
      ? "정리 대상"
      : safeFormType === "APPROVAL"
      ? "결재 라인"
      : "보고 대상";

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
          문서 작성 시작
        </h1>

        <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 16 }}>
          문서 유형에 맞는 입력 항목을 작성하면 더 정확한 초안을 생성합니다.
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
        {tabs.map((tab) => {
          const active =
            tab === "template" ? false : safeFormType === tab;

          const icon =
            tab === "REPORT"
              ? I.file
              : tab === "MINUTES"
              ? I.users
              : tab === "APPROVAL"
              ? I.check
              : I.spark;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleTopTabClick(tab)}
              style={{
                ...styles.card,
                border: `1px solid ${active ? C.accent : C.border}`,
                background: active ? C.accentBg : "#fff",
                minHeight: 92,
                textAlign: "left",
                padding: 18,
                cursor: "pointer",
                color: C.text,
              }}
            >
              <div
                style={{
                  color: active ? C.accent : C.sub,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Icon>{icon}</Icon>

                <span style={{ fontSize: 15, fontWeight: 800 }}>
                  {docMeta?.[tab]?.label || tab}
                </span>
              </div>

              {docMeta?.[tab]?.description && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: C.sub,
                    lineHeight: 1.5,
                  }}
                >
                  {docMeta[tab].description}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 입력 안내 박스 */}
      <div
        style={{
          ...styles.card,
          padding: 18,
          marginBottom: 18,
          background: "#F7FAFF",
        }}
      >
        <div style={{ color: C.accent, fontWeight: 900, fontSize: 15 }}>
          입력값이 구체적일수록 초안 품질이 높아집니다.
        </div>

        <div style={{ marginTop: 8, color: C.sub, fontSize: 14 }}>
          문서 목적, 대상, 핵심 내용을 명확히 입력하면 AI가 더 정확하고
          실무적인 결과를 생성합니다. 초안 생성 후에는 채팅으로 추가 수정도
          가능합니다.
        </div>
      </div>

      {/* 입력 폼 카드 */}
      <div style={{ ...styles.card, padding: 24 }}>
        <div style={{ display: "grid", gap: 16 }}>
          {/* 제목 */}
          <Field label={f.title} required>
            <TextInput
              value={safeFormData.title}
              onChange={(e) => onChangeFormData("title", e.target.value)}
              placeholder={f.titlePlaceholder}
            />
          </Field>

          {/* 작성 목적 */}
          <Field label={f.purpose} required>
            <TextInput
              value={safeFormData.purpose}
              onChange={(e) => onChangeFormData("purpose", e.target.value)}
              placeholder={f.purposePlaceholder}
            />
          </Field>

          {/* 대상 독자 */}
          <Field label={f.target} required>
            <TextInput
              value={safeFormData.audience}
              onChange={(e) => onChangeFormData("audience", e.target.value)}
              placeholder={f.targetPlaceholder}
            />
          </Field>

          {/* 보고 대상 / 정리 대상 / 결재 라인 */}
          <Field label={targetGroupLabel} required>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {targetOptions.map((item) => (
                <Chip
                  key={item}
                  active={safeFormData.targets.includes(item)}
                  onClick={() => {
                    const next = safeFormData.targets.includes(item)
                      ? safeFormData.targets.filter((value) => value !== item)
                      : [...safeFormData.targets, item];

                    onChangeFormData("targets", next);
                  }}
                >
                  {item}
                </Chip>
              ))}
            </div>
          </Field>

          {/* 핵심 내용 */}
          <Field label={f.detail} required>
            <div>
              <TextInput
                textarea
                value={safeFormData.detail}
                onChange={(e) => onChangeFormData("detail", e.target.value)}
                placeholder={f.detailPlaceholder}
              />

              <div
                style={{
                  textAlign: "right",
                  fontSize: 12,
                  color: C.muted,
                  marginTop: 8,
                }}
              >
                {safeFormData.detail.length} / 1000
              </div>
            </div>
          </Field>

          {/* 원하는 분량 / 정리 방식 / 강조 포인트 */}
          <Field label={f.amount}>
            <div
              style={{
                height: 46,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 14px",
                color: safeFormData.amount ? C.text : C.sub,
                fontSize: 14,
                background: "#fff",
              }}
            >
              <span>{safeFormData.amount || f.amountPlaceholder}</span>
              <Icon>{I.down}</Icon>
            </div>
          </Field>

          {/* 참고 자료 첨부 - 현재는 UI만 제공 */}
          <Field label="참고 자료 첨부">
            <div
              style={{
                border: `1px dashed ${C.border}`,
                borderRadius: 12,
                padding: 18,
                color: C.sub,
                background: "#FBFDFF",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontWeight: 700,
                }}
              >
                <Icon>{I.clip}</Icon>
                파일을 드래그하거나 클릭하여 첨부하세요 (최대 10MB)
              </div>

              <div style={{ marginTop: 10, fontSize: 13 }}>
                PDF, PPT, DOCX, XLSX, PNG, JPG 파일 지원
              </div>
            </div>
          </Field>
        </div>

        {/* 버튼 영역 */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 24,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* 입력 초기화 */}
          <AppButton
            variant="secondary"
            onClick={() => {
              onChangeFormData("title", "");
              onChangeFormData("purpose", "");
              onChangeFormData("audience", "");
              onChangeFormData("targets", []);
              onChangeFormData("detail", "");
              onChangeFormData("amount", "");
            }}
          >
            초기화
          </AppButton>

          {/* AI 초안 생성 */}
          <AppButton onClick={onGenerateDraft} disabled={generating}>
            <Icon>{I.spark}</Icon>
            {generating ? "AI 초안 생성 중..." : "AI 초안 생성"}
          </AppButton>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div
            style={{
              marginTop: 12,
              color: "#d32f2f",
              fontSize: 13,
              fontWeight: 700,
              textAlign: "right",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}