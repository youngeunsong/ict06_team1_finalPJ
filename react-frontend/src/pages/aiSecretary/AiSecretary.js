/* aiSecretary > 페이지 조립기 역활 */
// src/pages/aiSecretary/AiSecretary.js
/* “현재 상태를 보고 어떤 화면 컴포넌트를 렌더링할지 정한다” */

/* 미니 라우터 + 상태 컨트롤러 + 페이지 조립기 역할 */

import React, { useMemo, useState } from "react";
//URL(path/query/param)을 기준으로 분기
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { PATH } from "../../constants/path";

// 공통 UI 조각들은 pages/aiSecretary/components 폴더로 분리
import AppButton from "./components/AppButton";
import Bubble from "./components/Bubble";
import Chip from "./components/Chip";
import CompareCard from "./components/CompareCard";
import Field from "./components/Field";
import OptionGroup from "./components/OptionGroup";
import Section from "./components/Section";
import Sidebar from "./components/Sidebar";
import TextInput from "./components/TextInput";

import { docMeta, recentDocsSeed, templateCards } from "./constants/aiSecretaryData"; // 상수 데이터(docMeta, 최근 문서, 템플릿 목록)
import { I, Icon } from "./constants/aiSecretaryIcons"; // SVG 아이콘, Icon 래퍼
import { C, styles } from "./styles/aiSecretaryTheme"; // 색상(C), 공통 스타일(styles)

import { start } from "@popperjs/core";

const VALID_FORM_TYPES = ["report", "minutes", "approval"];

const normalizeFormType = (type) =>
  VALID_FORM_TYPES.includes(type) ? type : "report";

const buildAssistantDocPath = (docId) =>
  PATH.AI.ASSISTANT_DOC.replace(":docId", docId);

const ASSISTANT_DOC_PREFIX = PATH.AI.ASSISTANT_DOC.replace("/:docId", "");


// ---------------------------------------------------------
// AssistantHome: AI 비서 홈 화면 => 선택
// AI 비서 안에서 자주 쓰는 기능 진입 선택 화면
// 보고서 초안 / 회의록 정리 / 결재 사유 / 메일 문구 교정 / 템플릿 추천
// ---------------------------------------------------------
function AssistantHome({ onOpenForm, onOpenTemplate, recents, onRecentClick }) {
  // 빠른 실행 메뉴 탭
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

  // 최근 대화 리스트 페이징
  const PAGE_SIZE = 10;
  const [recentPage, setRecentPage] = useState(1);
  const totalRecentPages = Math.ceil(recents.length / PAGE_SIZE) || 1;
  const pagedRecents = recents.slice(
    (recentPage - 1) * PAGE_SIZE,
    recentPage * PAGE_SIZE
  );

  // 최근 작성 타입 라벨
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

      {/* 최근 작성 리스트 */}
      <div style={{ ...styles.card, marginTop: 18, padding: 22 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          {/* 상단 타이틀 */}
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

        {/* 리스트 페이징 - 10개 */}
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

// ---------------------------------------------------------
// StartFormScreen: 문서 작성 시작 입력 화면 => 입력(AI 문서 생성 작업 화면 이전 단계)
// 보고서 초안 / 회의록 정리 / 결재 사유 유형에 맞는 입력 폼을 보여주고, 사용자가 입력한 값을 바꾸고, 마지막에 AI 초안 생성을 위한 데이터 전달
// ---------------------------------------------------------
function StartFormScreen({
  formType,
  formData,
  onChangeFormType,
  onChangeFormData,
  onGenerateDraft,
  onOpenTemplate,
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
          <AppButton onClick={onGenerateDraft}>
            <Icon>{I.spark}</Icon>
            AI 초안 생성
          </AppButton>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// CorrectionScreen: 메일 문구 교정 작업 화면
// 1) 사용자가 교정할 메일 문구를 입력하고, 톤/수정 강도/길이 등의 옵션을 조절
// 2) 원문과 교정 결과를 비교
// ---------------------------------------------------------
function CorrectionScreen({ correction, setCorrection, onBackHome }) {
  return (
    <div style={styles.page}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 16, color: C.sub, fontWeight: 700 }}>
            문장 다듬기
          </div>
          <h1
            style={{
              margin: "6px 0 0",
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: -1,
            }}
          >
            문장 다듬기
          </h1>
          <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 16 }}>
            맞춤법, 톤, 길이, 표현을 조정해 문장을 더 자연스럽고 명확하게
            다듬습니다.
          </p>
        </div>
        <AppButton variant="secondary" onClick={onBackHome}>
          다른 기능 선택
        </AppButton>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 260px 1fr",
          gap: 16,
        }}
      >
        <div
          style={{
            ...styles.card,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            minHeight: 680,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={styles.sectionTitle}>문장 다듬기</h3>
            <Icon color={C.sub}>{I.refresh}</Icon>
          </div>

          <div style={{ display: "grid", gap: 16, marginTop: 18, flex: 1 }}>
            <Bubble
              role="ai"
              text={
                "안녕하세요! 문장을 더 정중하고 명확하게 다듬어 드릴게요.\n교정할 내용을 입력해 주세요."
              }
              time="오전 10:30"
            />
            <Bubble
              role="user"
              text={
                "아래 문장을 검토해 주시고,\n더 공손하고 명확하게 다듬어 주세요."
              }
              time="오전 10:31"
            />
            <Bubble
              role="ai"
              text={
                "네, 확인했습니다. 교정 옵션을 설정한 뒤 ‘이 옵션으로 다시 교정’을 클릭해 주세요."
              }
              time="오전 10:31"
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <div
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 12,
                minHeight: 112,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <textarea
                placeholder="메시지를 입력하세요..."
                style={{
                  flex: 1,
                  resize: "none",
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Icon color={C.sub}>{I.clip}</Icon>
                <button
                  type="button"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: "none",
                    background: C.accent,
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <Icon color="#fff">{I.send}</Icon>
                </button>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: C.muted }}>
              Enter로 전송, Shift+Enter로 줄바꿈
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, padding: 20 }}>
          <h3 style={styles.sectionTitle}>교정 옵션</h3>
          <div style={{ display: "grid", gap: 22, marginTop: 18 }}>
            <OptionGroup
              label="톤"
              options={["공손", "중립", "설득형"]}
              selected={correction.tone}
              onChange={(v) => setCorrection((prev) => ({ ...prev, tone: v }))}
            />
            <OptionGroup
              label="수정 강도"
              options={["가볍게", "보통", "강하게"]}
              selected={correction.strength}
              onChange={(v) =>
                setCorrection((prev) => ({ ...prev, strength: v }))
              }
            />
            <OptionGroup
              label="길이 조절"
              options={["축약", "유지", "확장"]}
              selected={correction.length}
              onChange={(v) =>
                setCorrection((prev) => ({ ...prev, length: v }))
              }
            />

            <div>
              <div
                style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}
              >
                맞춤법 보정
              </div>
              <button
                type="button"
                onClick={() =>
                  setCorrection((prev) => ({
                    ...prev,
                    spellCheck: !prev.spellCheck,
                  }))
                }
                style={{
                  width: 52,
                  height: 30,
                  borderRadius: 999,
                  border: "none",
                  background: correction.spellCheck ? C.accent : "#CBD5E1",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: correction.spellCheck ? 26 : 3,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "0.15s ease",
                  }}
                />
              </button>
            </div>

            <AppButton style={{ width: "100%" }}>
              이 옵션으로 다시 교정
            </AppButton>
            <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>
              교정 옵션은 채팅 화면 안에서 바로 조절합니다.
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, overflow: "hidden" }}>
          <div
            style={{
              padding: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <h3 style={{ ...styles.sectionTitle, fontSize: 16 }}>
              원문 / 교정 결과 비교
            </h3>
            <div style={{ display: "flex", gap: 10 }}>
              <AppButton variant="secondary" style={{ height: 40 }}>
                <Icon>{I.copy}</Icon>
                복사
              </AppButton>
            </div>
          </div>

          <div style={{ padding: "0 20px" }}>
            <div
              style={{
                display: "flex",
                gap: 24,
                height: 58,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  color: C.accent,
                  fontWeight: 800,
                  borderBottom: `3px solid ${C.accent}`,
                  paddingBottom: 13,
                }}
              >
                나란히 보기
              </div>
              <div style={{ color: C.sub, fontWeight: 700 }}>변경점 보기</div>
            </div>
          </div>

          <div
            style={{
              padding: 20,
              display: "grid",
              gridTemplateColumns: "1fr 68px 1fr",
              gap: 14,
            }}
          >
            <CompareCard
              title="원문"
              body={[
                "안녕하세요, 김지훈 대리님.",
                "요청하신 자료를 첨부와 같이 전달드립니다.",
                "자료 검토 후 의견 주시면 반영하겠습니다.",
                "감사합니다.",
                "이수진 드림",
              ]}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#F8FAFC",
                  border: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  color: C.sub,
                  fontWeight: 700,
                }}
              >
                비교
              </div>
            </div>
            <CompareCard
              title="교정 결과"
              accent
              body={[
                "안녕하세요, 김지훈 대리님.",
                "요청하신 자료를 첨부와 같이 전달드립니다.",
                "검토 후 의견을 주시면 반영하여 개선하겠습니다.",
                "감사합니다.",
                "이수진 드림",
              ]}
            />
          </div>

          <div
            style={{
              padding: 20,
              borderTop: `1px solid ${C.border}`,
              color: C.sub,
              fontSize: 13,
            }}
          >
            교정 결과는 참고용으로, 최종 내용은 사용자가 확인 후 사용해 주세요.
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// TemplateScreen: 템플릿 추천/선택 화면 => (AI 문서 생성 작업 화면 이전 단계)
// 1) 사용자가 문서 카테고리, 상황, 톤앤매너 등의 조건을 선택
// 2) 관리자가 미리 등록한 템플릿을 추천받고 선택해서 시작
// ---------------------------------------------------------
function TemplateScreen({ onStartTemplate, onOpenForm }) {
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

// ---------------------------------------------------------
// WriterScreen: 실질적인 AI 초안 작성/수정 작업 화면
// 생성된 초안을 확인하고
// AI와 대화하며 수정 요청을 보내고, 문서 미리보기와 변경 이력을 통해 초안을 점진적으로 다듬는 화면
function WriterScreen({ writerState, setWriterState, writerType = "report" }) {
  const versions = writerState.versions; // 초기 버전 
  const [previewVersionId, setPreviewVersionId] = useState( // 수정 버전 표기
    versions.find((v) => v.current)?.id || versions[versions.length - 1]?.id
  );

  // prev.versions가 undefined여도 안전하게 처리
  const handleRestoreVersion = (versionId) => {
    setWriterState((prev) => {
      const safeVersion = Array.isArray(prev?.version) ? prev.version : [];

      return {
        ...prev,
        version: safeVersion.map((v) => ({
          ...v,
          current: v.id === versionId,
        })),
      };
    });

    setPreviewVersionId(versionId);
    showActionMessage(`${versionId} 버전으로 복원`)
  }

  const handlePreviewVersion = (versionId) => {
    setPreviewVersionId(versionId);
  }

  const [actionMessage, setActionMessage ] = useState(""); // 버튼 클릭에 따른 액션 메시지

  // 버튼 클릭에 다른 액션 일정 시간 노출 (복사 완료/ 다운로드 시작/ 전자결재 임시 보관함 저장)
  const showActionMessage = (message) => {
    setActionMessage(message);
    window.clearTimeout(showActionMessage._timer); // clearTimeout = 자바스크립트에서 기본으로 제공하는 타이버 삭제 함수
    showActionMessage._timer = window.setTimeout(() => { // setTimeout = 몇 초 뒤에 줄괄호 안에 함수 실행
      setActionMessage("");
    }, 2000);
  }

  const documentMap = {
    report: {
      chipLabel: "보고서 초안",
      title: "3분기 마케팅 성과 보고서 초안",
      stats: "글자 수 1,248자 | 페이지 수 A4 3페이지(예상)",
      section1:
        "본 보고서는 2024년 3분기 마케팅 활동의 성과를 요약하고, 주요 인사이트와 향후 방향성을 제시하기 위해 작성되었습니다.",
      section2: (
        <>
          • 전체 캠페인 성과: 전분기 대비 매출 18% 증가, 신규 리드 24%
          증가
          <br />• 주요 채널 성과: 검색 광고 효율 26% 개선, SNS 도달 32%
          증가
          <br />• 브랜드 지표: 브랜드 인지도 8%p 상승, 고객 선호도 6%p 상승
        </>
      ),
      selectedTitle: "3. 결론",
      selectedBody: (
        <>
          3분기 마케팅 활동은 전반적으로 긍정적인 성과를 달성했습니다.
          <br />
          핵심 채널의 효율 개선과 신규 캠페인의 성과가 매출과 리드 성장에
          기여했습니다.
          <br />
          4분기에는 콘텐츠 고도화와 타겟 세분화를 통해 성과를 더욱
          확대하겠습니다.
        </>
      ),
      section4: (
        <>
          • 핵심 캠페인 지속 운영 및 예산 효율화
          <br />• 데이터 기반 타겟 세분화 및 개인화 강화
          <br />• 크로스 채널 연계 캠페인 확대
        </>
      ),
      documentText: [
        "1. 개요",
        "본 보고서는 2024년 3분기 마케팅 활동의 성과를 요약하고, 주요 인사이트와 향후 방향성을 제시하기 위해 작성되었습니다.",
        "",
        "2. 주요 성과",
        "- 전체 캠페인 성과: 전분기 대비 매출 18% 증가, 신규 리드 24% 증가",
        "- 주요 채널 성과: 검색 광고 효율 26% 개선, SNS 도달 32% 증가",
        "- 브랜드 지표: 브랜드 인지도 8%p 상승, 고객 선호도 6%p 상승",
        "",
        "3. 결론",
        "3분기 마케팅 활동은 전반적으로 긍정적인 성과를 달성했습니다.",
        "핵심 채널의 효율 개선과 신규 캠페인의 성과가 매출과 리드 성장에 기여했습니다.",
        "4분기에는 콘텐츠 고도화와 타겟 세분화를 통해 성과를 더욱 확대하겠습니다.",
        "",
        "4. 향후 계획",
        "- 핵심 캠페인 지속 운영 및 예산 효율화",
        "- 데이터 기반 타겟 세분화 및 개인화 강화",
        "- 크로스 채널 연계 캠페인 확대",
      ].join("\n"),
    },

    minutes: {
      chipLabel: "회의록 정리",
      title: "4월 주간 운영회의 회의록",
      stats: "글자 수 986자 | 페이지 수 A4 2페이지(예상)",
      section1:
        "본 회의록은 4월 주간 운영회의에서 논의된 진행 현황, 주요 이슈, 의사결정 사항을 정리한 문서입니다.",
      section2: (
        <>
          • 참석 부서: 전략기획팀, 디자인팀, 개발팀
          <br />• 핵심 안건: 프로젝트 일정 점검, 기능 우선순위 조정, 리소스
          배분 검토
          <br />• 주요 논의: 일정 지연 리스크와 대응 방안 공유
        </>
      ),
      selectedTitle: "3. 결정 사항",
      selectedBody: (
        <>
          디자인 시안 확정은 이번 주 금요일까지 마무리하고, 개발 우선순위는
          로그인/권한/대시보드 순으로 진행하기로 결정했습니다.
          <br />
          추가 인력 요청은 다음 주 운영회의에서 다시 검토합니다.
        </>
      ),
      section4: (
        <>
          • 디자인팀: 메인 시안 최종본 공유
          <br />• 개발팀: API 명세 정리 및 일정 재산정
          <br />• 기획팀: 관리자 요구사항 정리본 배포
        </>
      ),
      documentText: [
        "1. 회의 개요",
        "본 회의록은 4월 주간 운영회의에서 논의된 진행 현황, 주요 이슈, 의사결정 사항을 정리한 문서입니다.",
        "",
        "2. 주요 논의 내용",
        "- 참석 부서: 전략기획팀, 디자인팀, 개발팀",
        "- 핵심 안건: 프로젝트 일정 점검, 기능 우선순위 조정, 리소스 배분 검토",
        "- 주요 논의: 일정 지연 리스크와 대응 방안 공유",
        "",
        "3. 결정 사항",
        "디자인 시안 확정은 이번 주 금요일까지 마무리하고, 개발 우선순위는 로그인/권한/대시보드 순으로 진행하기로 결정했습니다.",
        "추가 인력 요청은 다음 주 운영회의에서 다시 검토합니다.",
        "",
        "4. 액션 아이템",
        "- 디자인팀: 메인 시안 최종본 공유",
        "- 개발팀: API 명세 정리 및 일정 재산정",
        "- 기획팀: 관리자 요구사항 정리본 배포",
      ].join("\n"),
    },

    approval: {
      chipLabel: "결재 사유",
      title: "외부 교육 참가 결재 요청",
      stats: "글자 수 742자 | 페이지 수 A4 1페이지(예상)",
      section1:
        "본 문서는 프로젝트 수행 역량 강화를 위해 외부 교육 참가 승인을 요청하기 위한 결재 사유서입니다.",
      section2: (
        <>
          • 교육명: React 기반 업무용 프론트엔드 설계 실무
          <br />• 일정: 2024.06.05 ~ 2024.06.06
          <br />• 비용: 교육비 250,000원 / 총 1인
        </>
      ),
      selectedTitle: "3. 요청 사유",
      selectedBody: (
        <>
          본 교육은 현재 진행 중인 사내 AI 포털 구축 프로젝트의 프론트엔드
          품질 향상에 직접적으로 기여할 수 있습니다.
          <br />
          특히 컴포넌트 구조화, 상태 관리, 화면 전환 설계 역량을 강화하여
          프로젝트 생산성과 유지보수성을 높일 수 있습니다.
        </>
      ),
      section4: (
        <>
          • 교육 이수 후 팀 내 공유 세션 진행
          <br />• AI 비서 / 챗봇 프론트 화면 고도화에 즉시 적용
          <br />• 반복 UI 구조 정리 및 컴포넌트 재사용성 개선
        </>
      ),
      documentText: [
        "1. 결재 개요",
        "본 문서는 프로젝트 수행 역량 강화를 위해 외부 교육 참가 승인을 요청하기 위한 결재 사유서입니다.",
        "",
        "2. 교육 정보",
        "- 교육명: React 기반 업무용 프론트엔드 설계 실무",
        "- 일정: 2024.06.05 ~ 2024.06.06",
        "- 비용: 교육비 250,000원 / 총 1인",
        "",
        "3. 요청 사유",
        "본 교육은 현재 진행 중인 사내 AI 포털 구축 프로젝트의 프론트엔드 품질 향상에 직접적으로 기여할 수 있습니다.",
        "특히 컴포넌트 구조화, 상태 관리, 화면 전환 설계 역량을 강화하여 프로젝트 생산성과 유지보수성을 높일 수 있습니다.",
        "",
        "4. 기대 효과",
        "- 교육 이수 후 팀 내 공유 세션 진행",
        "- AI 비서 / 챗봇 프론트 화면 고도화에 즉시 적용",
        "- 반복 UI 구조 정리 및 컴포넌트 재사용성 개선",
      ].join("\n"),
    },
  };

  const currentDoc = documentMap[writerType] || documentMap.report;
  const isApprovalDocument = writerType === "approval";

  const addMessage = () => {
    if (!writerState.prompt.trim()) return;

    const nextMessage = {
      role: "user",
      text: writerState.prompt,
      time: "10:16 AM",
    };

    const aiMessage = {
      role: "ai",
      text: "요청하신 내용에 맞게 문서를 업데이트했습니다.",
      time: "10:17 AM",
    };

    const nextVersion = {
      id: `v${versions.length + 1}`,
      title: "추가 수정",
      summary: writerState.prompt,
      current: true,
    };

    setWriterState((prev) => ({
      ...prev,
      chat: [...prev.chat, nextMessage, aiMessage],
      prompt: "",
      versions: [
        ...prev.versions.map((v) => ({ ...v, current: false })),
        nextVersion,
      ],
    }));
  };


  // 복사 버튼 실행 로직
  const handleCopy = async () => {
    const textToCopy = `${currentDoc.title}\n\n${currentDoc.documentText}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        showActionMessage("문서 내용이 복사되었습니다.");
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = textToCopy;
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      showActionMessage("문서 내용이 복사되었습니다.");
    } catch (error) {
      console.warn("복사 기능을 사용할 수 없습니다.", error);
      showActionMessage("복사에 실패했습니다.");
    }
  };

  // 다운로드 
  const handleDownload = () => {
    const blob = new Blob(
      [`${currentDoc.title}\n\n${currentDoc.documentText}`],
      { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentDoc.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showActionMessage("문서 다운로드가 시작되었습니다.");
  };

  // 전자결재로 내보내기
  const handleExportToApproval = () => {
    const nextVersion = {
      id: `v${versions.length + 1}`,
      title: "전자결재 내보내기",
      summary: "문서를 전자결재 > 임시보관함으로 내보냈습니다.",
      current: true,
    };

    setWriterState((prev) => ({
      ...prev,
      showHistory: true,
      versions: [
        ...prev.versions.map((v) => ({ ...v, current: false })),
        nextVersion,
      ],
    }));

    showActionMessage("전자결재 > 임시보관함에 문서가 저장되었습니다.");
  };

  return (
    <div
      style={{
        ...styles.page,
        paddingRight: writerState.showHistory ? 12 : 28,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: -1,
            }}
          >
            AI 비서 · 문서 작성
          </h1>
          <div
            style={{
              height: 34,
              padding: "0 12px",
              borderRadius: 10,
              background: C.accentBg,
              color: C.accent,
              display: "flex",
              alignItems: "center",
              fontWeight: 800,
            }}
          >
            {currentDoc.chipLabel}
          </div>
        </div>
        <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 16 }}>
          생성된 초안입니다. 필요에 따라 수정하거나 바로 활용할 수 있습니다.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: writerState.showHistory
            ? "300px 1fr 280px"
            : "300px 1fr",
          gap: 16,
        }}
      >
        <div
          style={{
            ...styles.card,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            minHeight: 760,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={styles.sectionTitle}>AI와 대화</h3>
          </div>

          <div
            style={{
              marginTop: 18,
              flex: 1,
              display: "grid",
              gap: 16,
              alignContent: "start",
            }}
          >
            {writerState.chat.map((msg, idx) => (
              <Bubble
                key={`${msg.time}-${idx}`}
                role={msg.role}
                text={msg.text}
                time={msg.time}
              />
            ))}

            <div style={{ ...styles.card, padding: 14, borderRadius: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>
                {currentDoc.title}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: C.sub }}>
                최근 수정 · 10:17 AM
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: C.accent,
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                미리보기
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: 12,
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <input
                value={writerState.prompt}
                onChange={(e) =>
                  setWriterState((prev) => ({
                    ...prev,
                    prompt: e.target.value,
                  }))
                }
                placeholder="수정 요청을 입력하세요..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                }}
              />
              <button
                type="button"
                onClick={addMessage}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  background: C.accent,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <Icon color="#fff">{I.send}</Icon>
              </button>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: C.muted }}>
              예) 도입부를 더 간결하게, 표로 정리해줘, 근거 데이터 추가 등
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, overflow: "hidden" }}>
          <div
            style={{ padding: 18, borderBottom: `1px solid ${C.border}` }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <AppButton
                variant="secondary"
                style={{ height: 36 }}
                onClick={() =>
                  setWriterState((prev) => ({
                    ...prev,
                    showHistory: !prev.showHistory,
                  }))
                }
              >
                <Icon>{I.history}</Icon>
                버전 기록
              </AppButton>

              {isApprovalDocument && (
                <AppButton
                  style={{ height: 36 }}
                  onClick={handleExportToApproval}
                >
                  전자결재로 내보내기
                </AppButton>
              )}

              <AppButton
                variant="secondary"
                style={{ height: 36 }}
                onClick={handleDownload}
              >
                <Icon>{I.download}</Icon>
                다운로드
              </AppButton>

              <AppButton
                variant="secondary"
                style={{ height: 36 }}
                onClick={handleCopy}
              >
                <Icon>{I.copy}</Icon>
                복사
              </AppButton>
            </div>

            <div
              style={{
                marginTop: 14,
                background: C.softBlue,
                borderRadius: 12,
                padding: "12px 14px",
                color: C.accent,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              생성된 문서는 바로 복사하거나 다운로드할 수 있으며, 추가 수정은
              AI와 대화를 통해 이어갈 수 있습니다.
            </div>

            {actionMessage && (
              <div
                style={{
                  marginTop: 10,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: C.softGreen,
                  color: C.success,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {actionMessage}
              </div>
            )}
          </div>

          <div style={{ padding: 22 }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>
              {currentDoc.title}
            </div>
            <div style={{ marginTop: 24, lineHeight: 1.85, fontSize: 15 }}>
              <Section title="1. 개요">{currentDoc.section1}</Section>
              <Section title="2. 주요 내용">{currentDoc.section2}</Section>

              {/* [수정] 수정 사유:
                  '선택 문단 재생성' 버튼을 제거했기 때문에
                  문서 본문 안의 '선택 문단' 배지/강조 UI도 같이 제거함.
                  다만 현재 문서 구조상 핵심 문단은 유지해야 하므로
                  일반 문단 카드처럼 보이도록 완화한 상태를 유지함. */}
              <div
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: 18,
                  marginBottom: 24,
                  background: "#FCFDFF",
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    marginBottom: 12,
                  }}
                >
                  {currentDoc.selectedTitle}
                </div>
                {currentDoc.selectedBody}
              </div>

              <Section title="4. 후속 계획">{currentDoc.section4}</Section>
            </div>
          </div>

          <div
            style={{
              padding: "14px 22px",
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: C.sub,
              fontSize: 13,
            }}
          >
            <div>{currentDoc.stats}</div>
          </div>
        </div>

        {writerState.showHistory && (
          <div style={{ ...styles.card, padding: 20, minHeight: 760 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={styles.sectionTitle}>버전 기록</h3>

                {/* [수정] 수정 사유:
                    자동 저장 상태는 중앙 액션 바보다
                    버전 기록과 맥락이 더 맞기 때문에
                    3열 우측 패널 타이틀 옆으로 이동한 상태를 유지함. */}
                <div
                  style={{
                    height: 28,
                    padding: "0 10px",
                    borderRadius: 999,
                    background: C.softGreen,
                    color: C.success,
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  자동 저장
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setWriterState((prev) => ({
                    ...prev,
                    showHistory: false,
                  }))
                }
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 20,
                  cursor: "pointer",
                  color: C.sub,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ ...styles.sectionSub, marginTop: 10 }}>
              이전 버전을 미리보기하고, 원하는 버전으로 복원할 수 있습니다.
            </div>

            {/* 이전 버전 */}
            <div style={{ marginTop: 22, display: "grid", gap: 16 }}>
              {versions.slice().reverse().map((version) => (
                  <div
                    key={version.id}
                    style={{
                      ...styles.card,
                      padding: 16,
                    border:
                      previewVersionId === version.id
                        ? `1px solid ${C.accent}`
                        : `1px solid ${C.border}`,
                    background: previewVersionId === version.id ? "#F8FBFF" : "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          border: `2px solid ${C.accent}`,
                          color: C.accent,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 900,
                        }}
                      >
                        {version.id}
                      </div>

                      {version.current && (
                        <div
                          style={{
                            height: 26,
                            padding: "0 10px",
                            borderRadius: 999,
                            background: C.softGreen,
                            color: C.success,
                            display: "flex",
                            alignItems: "center",
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          현재
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 12, fontWeight: 900 }}>
                      {version.title}
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        color: C.sub,
                        lineHeight: 1.6,
                      }}
                    >
                      {version.summary}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <AppButton
                        variant="secondary"
                        style={{ flex: 1 }}
                        onClick={() => handlePreviewVersion(version.id)}>
                        미리보기
                      </AppButton>
                      
                      <AppButton
                        style={{ flex: 1 }}
                        onClick={() => {
                          handleRestoreVersion(version.id)
                        }}
                      >
                        이 버전으로 복원
                      </AppButton>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// 챗봇 전용 화면 ---------------------------------------------
// ChatbotScreen: 사내 지식 질의응답 화면
// 사용자가 사내 규정, 업무 절차, 운영 정보 등을 질문하면 AI가 채팅 형태로 답변
function ChatbotScreen() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "사내 규정이나 업무 절차에 대해 무엇이든 질문해 주세요.",
      time: "오전 9:10",
    },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: input, time: "오전 9:11" },
      {
        role: "ai",
        text: "관련 정보를 사내 문서에서 검색해 답변을 준비 중입니다.",
        time: "오전 9:11",
      },
    ]);
    setInput("");
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, color: C.sub, fontWeight: 700 }}>
          AI 챗봇
        </div>
        <h1
          style={{
            margin: "6px 0 0",
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: -1,
          }}
        >
          사내 지식 검색
        </h1>
      </div>

      <div
        style={{
          ...styles.card,
          padding: 20,
          minHeight: 720,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "grid",
            gap: 16,
            alignContent: "start",
          }}
        >
          {messages.map((msg, idx) => (
            <Bubble
              key={`${msg.time}-${idx}`}
              role={msg.role}
              text={msg.text}
              time={msg.time}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 12,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="질문을 입력하세요..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 14,
            }}
          />
          <button
            type="button"
            onClick={send}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "none",
              background: C.accent,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <Icon color="#fff">{I.send}</Icon>
          </button>
        </div>
      </div>
    </div>
  );
}

// 문서 삽입 ---------------------------------------------
function KnowledgeRequestScreen() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    topics: "",
    scope: "전사 공개",
  });

  const scopeOptions = ["전사 공개", "부서 공개", "특정 권한"];

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, color: C.sub, fontWeight: 700 }}>
          지식 추가 요청
        </div>
        <h1
          style={{
            margin: "6px 0 0",
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: -1,
          }}
        >
          챗봇 지식 추가 요청
        </h1>
        <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 16 }}>
          챗봇 답변에 반영할 문서를 등록 요청하고, 관리자의 검토 후 승인되면
          지식베이스에 반영됩니다.
        </p>
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
          사용자는 직접 반영하는 대신, 지식 추가 요청을 등록합니다.
        </div>
        <div style={{ marginTop: 8, color: C.sub, fontSize: 14 }}>
          문서의 목적, 관련 질문 주제, 공개 범위를 함께 제출하면 관리자가
          검토 후 승인 또는 반려를 결정합니다.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div style={{ ...styles.card, padding: 24 }}>
          <div style={{ display: "grid", gap: 16 }}>
            <Field label="문서 제목" required>
              <TextInput
                placeholder="예) 2024 하반기 출장비 정산 가이드"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </Field>

            <Field label="문서 설명" required>
              <TextInput
                textarea
                placeholder="예) 챗봇이 출장비 정산 절차, 제출 서류, 한도 기준을 답변할 수 있도록 반영 요청합니다."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </Field>

            <Field label="관련 질문 주제" required>
              <TextInput
                placeholder="예) 출장비 정산, 영수증 제출, 법인카드 사용 기준"
                value={form.topics}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, topics: e.target.value }))
                }
              />
            </Field>

            <Field label="공개 범위 제안" required>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {scopeOptions.map((option) => (
                  <Chip
                    key={option}
                    active={form.scope === option}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, scope: option }))
                    }
                  >
                    {option}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field label="문서 첨부" required>
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
                  파일을 드래그하거나 클릭하여 업로드하세요 (최대 20MB)
                </div>
                <div style={{ marginTop: 10, fontSize: 13 }}>
                  PDF, DOCX, PPTX 파일 권장
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
            <AppButton variant="secondary">임시 저장</AppButton>
            <AppButton>
              <Icon>{I.clip}</Icon>
              등록 요청 제출
            </AppButton>
          </div>
        </div>

        <div style={{ ...styles.card, padding: 22 }}>
          <h3 style={styles.sectionTitle}>요청 후 진행 절차</h3>
          <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
            {[
              "1. 사용자가 문서와 요청 사유를 제출합니다.",
              "2. 관리자가 문서 내용과 공개 범위를 검토합니다.",
              "3. 승인되면 지식베이스 반영 절차가 진행됩니다.",
              "4. 반려되면 사유와 함께 상태가 표시됩니다.",
            ].map((text) => (
              <div
                key={text}
                style={{ fontSize: 14, lineHeight: 1.7, color: C.text }}
              >
                {text}
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, margin: "18px 0" }} />

          <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
            민감한 문서나 권한 제한 문서는 관리자 승인 전까지 챗봇 답변에
            사용되지 않습니다.
          </div>
        </div>
      </div>
    </div>
  );
}

// 재공부 *****************************************************
// 흐름제어 컴포넌트 (화면X) ---------------------------------------------
// AiSecretaryPrototype(AiSecretary): AI 비서 상위 흐름 제어 컴포넌트
// 1) 탭 전환, 화면 전환, 문서 유형, 입력 데이터, 교정 옵션, 작성 상태 등을 관리
// 2) 현재 상태에 맞는 하위 화면을 렌더링하는 최상위 컨트롤 컴포넌트
// 내부 화면 전환을 state 기반이 아니라 URL 기반으로 동기화
export default function AiSecretary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { docId } = useParams();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    title: "",
    purpose: "",
    audience: "",
    targets: ["팀장"],
    detail: "",
    amount: "",
  });

  const [correction, setCorrection] = useState({
    tone: "공손",
    strength: "보통",
    length: "유지",
    spellCheck: true,
  });

  const [writerState, setWriterState] = useState({
    prompt: "",
    showHistory: true,
    chat: [
      {
        role: "ai",
        text: "요청 내용을 바탕으로 문서를 생성했습니다. 초안을 확인하고 필요한 부분을 알려주세요.",
        time: "10:12 AM",
      },
      {
        role: "user",
        text: "결론을 더 짧게 정리해줘.",
        time: "10:16 AM",
      },
      {
        role: "ai",
        text: "요청하신 내용에 맞게 결론을 간결하게 수정하여 초안을 업데이트했습니다.",
        time: "10:17 AM",
      },
    ],
    versions: [
      {
        id: "v1",
        title: "최초 생성",
        summary: "요청 내용을 바탕으로 초안을 처음 생성했습니다.",
        current: false,
      },
      {
        id: "v2",
        title: "결론 보강",
        summary: "결론 부분에 성과 요약과 향후 방향을 보강했습니다.",
        current: false,
      },
      {
        id: "v3",
        title: "팀장 보고용 톤 반영",
        summary: "결론을 간결하게 정리하고 보고용 톤으로 다듬었습니다.",
        current: true,
      },
    ],
  });

  const [recents] = useState(recentDocsSeed);

  // ------------------------------------------------
  // 1) 현재 URL에서 화면 상태를 파생
  // ------------------------------------------------

  const queryType = normalizeFormType(searchParams.get("type"));

  const matchedRecentDoc = useMemo(() => {
    return recents.find((doc) => doc.id === docId);
  }, [recents, docId]);

  const currentTab = useMemo(() => {
    if (location.pathname.startsWith(PATH.AI.CHATBOT)) return "chatbot";
    if (location.pathname.startsWith(PATH.AI.CORRECTION)) return "polish";
    if (location.pathname.startsWith(PATH.AI.KNOWLEDGE_REQUEST)) {
      return "knowledge-request";
    }
    return "assistant";
  }, [location.pathname]);

  const currentScreen = useMemo(() => {
    if (location.pathname === PATH.AI.ASSISTANT) return "assistant-home";
    if (location.pathname === PATH.AI.ASSISTANT_NEW) return "form";
    if (location.pathname === PATH.AI.ASSISTANT_TEMPLATE) return "template";
    if (location.pathname.startsWith(`${ASSISTANT_DOC_PREFIX}/`)) return "writer";
    return "assistant-home";
  }, [location.pathname]);

  const currentFormType = useMemo(() => {
    if (matchedRecentDoc?.type) return matchedRecentDoc.type;
    return queryType;
  }, [matchedRecentDoc, queryType]);

  // ------------------------------------------------
  // 2) URL 이동 helper
  // ------------------------------------------------

  const goAssistantHome = () => navigate(PATH.AI.ASSISTANT);

  const goAssistantForm = (type = "report") => {
    const normalized = normalizeFormType(type);
    navigate(`${PATH.AI.ASSISTANT_NEW}?type=${normalized}`);
  };

  const goAssistantTemplate = () => navigate(PATH.AI.ASSISTANT_TEMPLATE);

  const goAssistantDoc = (targetDocId, type = "report") => {
    const normalized = normalizeFormType(type);
    navigate(`${buildAssistantDocPath(targetDocId)}?type=${normalized}`);
  };

  const goChatbot = () => navigate(PATH.AI.CHATBOT);
  const goCorrection = () => navigate(PATH.AI.CORRECTION);
  const goKnowledgeRequest = () => navigate(PATH.AI.KNOWLEDGE_REQUEST);

  // ------------------------------------------------
  // 3) 사이드바 / 최근작성 클릭 처리
  // ------------------------------------------------

  const handleSidebarChange = (next) => {
    if (next === "assistant") {
      goAssistantHome();
      return;
    }
    if (next === "chatbot") {
      goChatbot();
      return;
    }
    if (next === "polish") {
      goCorrection();
      return;
    }
    if (next === "knowledge-request") {
      goKnowledgeRequest();
      return;
    }
  };

  const handleRecentClick = (doc) => {
    if (doc.screen === "writer") {
      goAssistantDoc(doc.id, doc.type);
      return;
    }

    // [수정] 수정 사유:
    // 최근 작성 문서가 form 진입형이면 기존처럼 제목 정도는 미리 채워주되,
    // 화면 이동은 URL 기반으로 처리함.
    setFormData((prev) => ({
      ...prev,
      title: doc.title,
    }));

    goAssistantForm(doc.type);
  };

  // ------------------------------------------------
  // 4) URL 기반 화면 렌더링
  // ------------------------------------------------

  const page = useMemo(() => {
    if (currentTab === "chatbot") {
      return <ChatbotScreen />;
    }

    if (currentTab === "polish") {
      return (
        <CorrectionScreen
          correction={correction}
          setCorrection={setCorrection}
          onBackHome={goAssistantHome}
        />
      );
    }

    if (currentTab === "knowledge-request") {
      return <KnowledgeRequestScreen />;
    }

    if (currentScreen === "assistant-home") {
      return (
        <AssistantHome
          onOpenForm={goAssistantForm}
          onOpenTemplate={goAssistantTemplate}
          recents={recents}
          onRecentClick={handleRecentClick}
        />
      );
    }

    if (currentScreen === "form") {
      return (
        <StartFormScreen
          formType={currentFormType}
          formData={formData}
          onChangeFormType={goAssistantForm}
          onChangeFormData={(key, value) =>
            setFormData((prev) => ({ ...prev, [key]: value }))
          }
          onGenerateDraft={() =>
            goAssistantDoc(`draft-${currentFormType}`, currentFormType)
          }
          onOpenTemplate={goAssistantTemplate}
        />
      );
    }

    if (currentScreen === "template") {
      return (
        <TemplateScreen
          onOpenForm={goAssistantForm}
          onStartTemplate={(card) => {
            setFormData((prev) => ({
              ...prev,
              title: card.title,
            }));

            // [수정] 수정 사유:
            // 템플릿으로 시작은 현재 설계상 보고서 초안 폼으로 진입시키는 흐름 유지
            goAssistantForm("report");
          }}
        />
      );
    }

    if (currentScreen === "writer") {
      return (
        <WriterScreen
          writerState={writerState}
          setWriterState={setWriterState}
          writerType={currentFormType}
        />
      );
    }

    return (
      <AssistantHome
        onOpenForm={goAssistantForm}
        onOpenTemplate={goAssistantTemplate}
        recents={recents}
        onRecentClick={handleRecentClick}
      />
    );
  }, [
    currentTab,
    currentScreen,
    currentFormType,
    correction,
    writerState,
    recents,
    formData,
  ]);

  return (
    <div style={styles.app}>
      <Sidebar
        tab={currentTab}
        onTabChange={handleSidebarChange}
        recents={recents}
        onRecentClick={handleRecentClick}
      />
      <main style={styles.main}>{page}</main>
    </div>
  );
}
