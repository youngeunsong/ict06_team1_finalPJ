/* AiSecretary.js 전용 문서 작성(보고서 초안 / 회의록 정리 / 결재 사유 유형) 시작 화면 */
// src/pages/aiSecretary/screens/StartFormScreen.js

// StartFormScreen: 문서 작성 시작 입력 화면 => 입력(AI 문서 생성 작업 화면 이전 단계)
// 보고서 초안 / 회의록 정리 / 결재 사유 유형에 맞는 입력 폼을 보여주고, 사용자가 입력한 값을 바꾸고, 마지막에 AI 초안 생성을 위한 데이터 전달

import React from "react";
import AppButton from "../components/AppButton";
import Chip from "../components/Chip";
import Field from "../components/Field";
import TextInput from "../components/TextInput";
import { docMeta } from "../constants/aiSecretaryData";
import { I, Icon } from "../constants/aiSecretaryIcons";
import { C, styles } from "../styles/aiSecretaryTheme";

export default function StartFormScreen({
  formType,        // → 현재 문서 유형: report / minutes / approval
  formData,         // → 입력값
  onChangeFormType, // → 탭 변경
  onChangeFormData, // → 입력값 변경
  onGenerateDraft,  // → AI 초안 생성 버튼 클릭 시 실행
  onOpenTemplate,   // → 템플릿 탭 클릭 시 실행
  generating = false,
  error = "",
}) {
  const tabs = ["report", "minutes", "approval", "template"];

  const baseFields = {
    report: {
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
    minutes: {
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
    approval: {
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

  const handleTopTabClick = (tab) => {
    if (tab === "template") {
      onOpenTemplate();
      return;
    }
    onChangeFormType(tab);
  };

  const f = baseFields[formType] || baseFields.report;

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
          문서 작성 시작
        </h1>

        <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 16 }}>
          문서 유형에 맞는 입력 항목을 작성하면 더 정확한 초안을 생성합니다.
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
        {tabs.map((tab) => {
          const active = formType === tab;
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
                border: `1px solid ${active ? C.accent : C.border}`,
                background: active ? C.accentBg : "#fff",
                minHeight: 92,
                textAlign: "left",
                padding: 18,
                cursor: "pointer",
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
                  {docMeta[tab].label}
                </span>
              </div>
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
          입력값이 구체적일수록 초안 품질이 높아집니다.
        </div>

        <div style={{ marginTop: 8, color: C.sub, fontSize: 14 }}>
          문서 목적, 대상, 핵심 내용을 명확히 입력하면 AI가 더 정확하고
          실무적인 결과를 생성합니다. 초안 생성 후에는 채팅으로 추가 수정도
          가능합니다.
        </div>
      </div>

      <div style={{ ...styles.card, padding: 24 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <Field label={f.title} required>
            <TextInput
              value={formData.title}
              onChange={(e) => onChangeFormData("title", e.target.value)}
              placeholder={f.titlePlaceholder}
            />
          </Field>

          <Field label={f.purpose} required>
            <TextInput
              value={formData.purpose}
              onChange={(e) => onChangeFormData("purpose", e.target.value)}
              placeholder={f.purposePlaceholder}
            />
          </Field>

          <Field label={f.target} required>
            <TextInput
              value={formData.audience}
              onChange={(e) => onChangeFormData("audience", e.target.value)}
              placeholder={f.targetPlaceholder}
            />
          </Field>

          <Field
            label={
              formType === "minutes"
                ? "정리 대상"
                : formType === "approval"
                ? "결재 라인"
                : "보고 대상"
            }
            required
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                formType === "minutes" ? "참석자 공유" : "팀장",
                formType === "minutes" ? "의사결정자" : "부서장",
                formType === "minutes" ? "액션아이템 중심" : "전사 공유",
              ].map((item) => (
                <Chip
                  key={item}
                  active={formData.targets.includes(item)}
                  onClick={() => {
                    const next = formData.targets.includes(item)
                      ? formData.targets.filter((v) => v !== item)
                      : [...formData.targets, item];
                    onChangeFormData("targets", next);
                  }}
                >
                  {item}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label={f.detail} required>
            <div>
              <TextInput
                textarea
                value={formData.detail}
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
                {formData.detail.length} / 1000
              </div>
            </div>
          </Field>

          <Field label={f.amount} required>
            <div
              style={{
                height: 46,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 14px",
                color: formData.amount ? C.text : C.sub,
                fontSize: 14,
              }}
            >
              <span>{formData.amount || f.amountPlaceholder}</span>
              <Icon>{I.down}</Icon>
            </div>
          </Field>

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

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 24,
          }}
        >
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

          <AppButton onClick={onGenerateDraft} disabled={generating}>
            <Icon>{I.spark}</Icon>
            {generating ? "AI 초안 생성 중..." : "AI 초안 생성"}
          </AppButton>
        </div>
      </div>
    </div>
  );
}