
/* “현재 상태를 보고 어떤 화면 컴포넌트를 렌더링할지 정한다” */
// AI 비서 홈 → 보고서 / 회의록 / 결재사유 선택 → StartFormScreen → AI 초안 생성 → WriterScreen

/* 미니 라우터 + 상태 컨트롤러 + 페이지 조립기 역할 */

import React, { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import AppButton from "./components/AppButton";
import Field from "./components/Field";
import TextInput from "./components/TextInput";
import Chip from "./components/Chip";
import Bubble from "./components/Bubble";
import OptionGroup from "./components/OptionGroup";
import CompareCard from "./components/CompareCard";
import Section from "./components/Section";
import { C, styles, Icon } from "./styles/aiSecretaryTheme";
import { I } from "./constants/aiSecretaryIcons";
import {
  docMeta,
  recentDocsSeed,
  templateCards,
  initialCorrection,
  initialFormData,
  initialWriterState,
} from "./constants/aiSecretaryData";
import { start } from "@popperjs/core";

// ---------------------------------------------------------
// AssistantHome: AI 비서 홈 화면 => 선택
// AI 비서 안에서 자주 쓰는 기능 진입 선택 화면
// 보고서 초안 / 회의록 정리 / 결재 사유 / 메일 문구 교정 / 템플릿 추천
// ---------------------------------------------------------
function AssistantHome({ onOpenForm, onOpenCorrection, onOpenTemplate }) {
  const quicks = [
    { id: "report", label: "보고서 초안", icon: I.file, color: "#EEF2FF", iconColor: "#4F46E5" },
    { id: "minutes", label: "회의록 정리", icon: I.users, color: "#ECFDF5", iconColor: "#059669" },
    { id: "approval", label: "결재 사유", icon: I.check, color: "#F5F3FF", iconColor: "#7C3AED" },
    { id: "mail", label: "메일 문구 교정", icon: I.mail, color: "#FFF7ED", iconColor: "#EA580C" },
    { id: "template", label: "템플릿 추천", icon: I.spark, color: "#EFF6FF", iconColor: "#2563EB" },
  ];

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, padding: 28 }}>
        <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1 }}>AI 비서</div>
        <div style={{ ...styles.sectionSub, fontSize: 16 }}>
          문서 작성, 문구 교정, 관리자 제공 템플릿 추천까지 한 화면에서 시작할 수 있습니다.
        </div>

        {/* 메뉴 선택 버튼 5종 */}
        <div style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 14,
        }}>
          {quicks.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "mail") return onOpenCorrection();
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

              <div style={{ marginTop: 14, fontWeight: 800, fontSize: 15 }}>{item.label}</div>
              <div style={{ marginTop: 8, fontSize: 13, color: C.sub, lineHeight: 1.5 }}>
                {docMeta[item.id].description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// StartFormScreen: 문서 작성 시작 입력 화면 => 입력(AI 문서 생성 작업 화면 이전 단계)
// 보고서 초안 / 회의록 정리 / 결재 사유 유형에 맞는 입력 폼을 보여주고, 사용자가 입력한 값을 바꾸고, 마지막에 AI 초안 생성을 위한 데이터 전달
// ---------------------------------------------------------
function StartFormScreen(props) {
  // 1. 부모(AiSecretary)로 부터 props를 꺼내서 사용
  const formType = props.formType;
  const formData = props.formData; // 실제 입력값 묶음
  const onChangeFormType = props.onChangeFormType; // 상단 탭(문서 유형) 변경
  const onChangeFormData = props.onChangeFormData; // 입력값을 변경
  const onGenerateDraft = props.onGenerateDraft; // "AI 초안 생성" 버튼 클릭 시 실행
  const onOpenCorrection = props.onOpenCorrection; // 메일 문구 교정 화면으로 보내는 함수
  const onOpenTemplate = props.onOpenTemplate; // 템플릿 화면으로 보내는 함수

  // 2. 상단에 보여줄 문서 유형 탭
  const tabs = ["report", "minutes", "approval", "mail", "template"];

  // 3. 문서 유형 별 라벨/placeholder 설정
  const baseFields = {
    report: {
      title: "문서 제목",
      titlePlaceholder: "예) 3분기 마케팅 성과 보고서 초안",
      purpose: "작성 목적",
      purposePlaceholder: "예) 3분기 마케팅 활동 성과를 정리하고 향후 전략 방향을 제시하기 위함",
      target: "대상 독자",
      targetPlaceholder: "예) 마케팅팀 팀장 및 유관 부서 담당자",
      detail: "핵심 내용",
      detailPlaceholder: "주요 이슈, 배경, 현황, 분석, 시사점, 제안 등을 자유롭게 작성해 주세요.",
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
      detailPlaceholder: "회의 발언 내용, 안건, 의사결정 사항, 액션아이템을 입력해 주세요.",
      amount: "정리 방식",
      amountPlaceholder: "예) 결정사항 중심 / 액션아이템 중심",
    },
    approval: {
      title: "결재 제목",
      titlePlaceholder: "예) 외부 교육 참가 결재 요청",
      purpose: "요청 배경",
      purposePlaceholder: "예) 프로젝트 수행 역량 강화를 위한 외부 교육 참가 필요",
      target: "결재 대상",
      targetPlaceholder: "예) 팀장, 부서장",
      detail: "결재 사유",
      detailPlaceholder: "필요성, 예상 효과, 일정, 비용 등을 포함해 주세요.",
      amount: "강조 포인트",
      amountPlaceholder: "예) 비용 대비 효과 / 긴급성 / 업무 연관성",
    },
  };

  // 5. 문서 유형에 맞는 라벨/placeholder 찾기
  const f = baseFields[formType] || baseFields.report;

  // 6. 화면 렌더링
  return (
    <div style={styles.page}>
      {/* 상단 타이틀 (예. AI 비서 > 문서 작성 시작 ) */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 16, color: C.sub, fontWeight: 700 }}>
          AI 비서
        </div>

        <h1 style={{
            margin: "6px 0 0",
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: -1,
        }}>
          문서 작성 시작
        </h1>

        <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 16 }}>
          문서 유형에 맞는 입력 항목을 작성하면 더 정확한 초안을 생성합니다.
        </p>
      </div>

      {/* 전체 레이아웃 (좌: 입력폼/ 우: 안내 패널) */}
      <div style={{display: "grid", gridTemplateColumns: "1fr 300px", gap: 18}}>

        {/* 좌: 입력폼 시작 */}
        <div>
          {/* 상단 문서 유형 탭 - 선택 유형(formType)에 따라 active 스타일 적용 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 18
          }}>
            {tabs.map((tab) => {
              // 현재 탭이 선택 된 탭인지 여부
              const active = formType === tab;

              // 탭 종류에 따라 아이콘 지정
              const icon = 
                tab === "report"
                  ? I.file
                  : tab === "minutes"
                  ? I.users
                  : tab === "approval"
                  ? I.check
                  : tab === "mail"
                  ? I.mail
                  : I.spark;

              return (
                <button
                  key={tab}
                  onClick={() => {
                    if (tab === "mail") return onOpenCorrection();
                    if (tab === "template") return onOpenTemplate();

                    onChangeFormType(tab);
                  }}
                  style={{
                    ...styles.card,
                    border: `1px solid ${active ? C.accent : C.border}`,
                    background: active ? C.accentBg : "#fff",
                    minHeight: 92,
                    textAlign: "left",
                    padding: 18,
                    cursor: "pointer" 
                }}>
                  <div style={{
                    color: active ? C.accent : C.sub,
                    display: "flex",
                    alignItems: "center",
                    gap: 10
                  }}>
                    <Icon>{icon}</Icon>
                    <span style={{ fontSize: 15, fontWeight: 800 }}>
                      {docMeta[tab].label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 실제 입력 폼 카드 */}
          <div style={{ ...styles.card, padding: 24 }}>
            <div style={{ display: "grid", gap: 16 }}>
              {/* 제목 입력 */}
              <Field label={f.title} required>
                <TextInput
                  value={formData.title}
                  onChange={(e) => onChangeFormData("title", e.target.value)}
                  placeholder={f.titlePlaceholder}
                />
              </Field>

              {/* 작성 목적/ 회의 목적/ 요청 배경 입력 */}
              <Field label={f.purpose} required>
                <TextInput
                  value={formData.purpose}
                  onChange={(e) => onChangeFormData("purpose", e.target.value)}
                  placeholder={f.purposePlaceholder}
                />
              </Field>

              {/* 대상 독자 / 참석자 / 결재 대상 */}
              <Field label={f.target} required>
                <TextInput
                  value={formData.audience}
                  onChange={(e) => onChangeFormData("audience", e.target.value)}
                  placeholder={f.targetPlaceholder}
                />
              </Field>

              {/* 보고 대상/ 정리 대상/ 결재라인 - Chip 컴포넌트 활용 */}
              <Field
                label={
                  formType === "minutes"
                  ? "정리 대상"
                  : formType === "approval"
                  ? "결재 라인"
                  : "보고 대상"
              } required>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    formType === "minutes" ? "참석자 공유" : "팀장",
                    formType === "minutes" ? "의사결정자" : "부서장",
                    formType === "minutes" ? "액션아이템 중심" : "전사 공유",
                  ].map((item) => (
                    <Chip
                      key={item}
                      // 현재 선택 된 targets 배열 안에 item이 있는지 확인
                      active={formData.targets.includes(item)}
                      onClick={() => {
                        // 이미 있으면 제거, 없으면 추가
                        const next = formData.targets.includes(item)
                          ? formData.targets.filter((v) => v !== item)
                          : [...formData.targets, item];
                        
                        // 부모에게 "target 값을 이걸로 바꿔줘" 요청
                        onChangeFormData("targets", next);  
                      }}
                    >
                      {item}
                    </Chip>
                  ))}
                </div>
              </Field>

              {/* 핵심 내용/ 회의 내용/ 결재 사유 = textarea 형태 */}
              <Field label={f.detail} required>
                <div>
                  <TextInput
                    textarea
                    value={formData.detail}
                    onChange={(e) => onChangeFormData("detail", e.target.value)}
                    placeholder={f.detailPlaceholder}/>
                  
                  {/* 현재 글자 수 표시 */}
                  <div style={{
                    textAlign: "right",
                    fontSize: 12,
                    color: C.muted,
                    marginTop: 8
                  }}>
                    {formData.detail.length} / 1000
                  </div>
                </div>
              </Field>

              {/* 분량/ 정리 방식/ 강조 포인트 */}
              <Field label={f.amount} required>
                <div style={{
                  height: 46,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 14px",
                  color: formData.amount ? C.text : C.sub,
                  fontSize: 14
                }}>
                  <span>{formData.amount || f.amountPlaceholder}</span>
                  <Icon>{I.down}</Icon>
                </div>
              </Field>

              {/* 참고자료 첨부 */}
              <Field label="참고 자료 첨부">
                <div style={{
                  border: `1px dashed ${C.border}`,
                  borderRadius: 12,
                  padding: 18,
                  color: C.sub,
                  background: "#FBFDFF"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontWeight: 700,
                  }}>
                    <Icon>{I.clip}</Icon>
                    파일을 드래그하거나 클릭하여 첨부하세요 (최대 10MB)
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13 }}>
                    PDF, PPT, DOCX, XLSX, PNG, JPG 파일 지원
                  </div>
                </div>
              </Field>
            </div>
            
            {/* 하단 액션 버튼 - 초기화 / AI 초안 생성 */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 24
            }}>
              {/* 1. 초기화 버튼 - formData의 각 항목을 직접 비움 */}
              <AppButton
                variant="secondary"
                onClick={() => {
                  onChangeFormData("title", "");
                  onChangeFormData("purpose", "");
                  onChangeFormData("audience", "");
                  onChangeFormData("targets", "");
                  onChangeFormData("detail", "");
                  onChangeFormData("amount", "");
              }}>
                초기화
              </AppButton>

              {/* AI 초안 생성 - 부모가 SCREEN을 WRITER로 바꾸는 형식 추후 수정 */}
              <AppButton onClick={onGenerateDraft}>
                <Icon>{I.spark}</Icon>
                AI 초안 생성
              </AppButton>
            </div>
          </div>
        </div>

        {/* 우: 설명 패널 시작 */}
        <div style={{ ...styles.card, padding: 22, alignSelf: start }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 18,
            fontWeight: 900
           }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: C.accentBg,
                color: C.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
            <Icon>{I.spark}</Icon>
            </div>
           왜 필요한가요?
          </div>

          {/* 설명 리스트 */}
          <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
           {[
            "문서 유형별 입력값이 다릅니다",
            "입력이 구체적일수록 결과 품질이 올라갑니다",
            "초안 생성 후 채팅으로 추가 수정이 가능합니다"
           ]. map((txt) => (
            <div
              key={txt}
              style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  background: C.softBlue,
                  color: C.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Icon>{I.file}</Icon>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>
                 {txt}
                </div>
            </div>
           ))}
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, margin: "18px 0" }} />
          
          {/* 작성 팁 안내 */}
          <div style={{
            padding: 14,
            borderRadius: 12,
            background: "#F8FAFC",
            border: `1px solid ${C.border}`
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>
              작성 팁
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
              이 패널은 행동 버튼이 아니라 입력 가이드 영역입니다.
              <br />
              실제 실행은 하단의 <b>AI 초안 생성</b> 버튼에서만 시작되도록 두는 편이 더 자연스럽습니다.
            </div>
          </div>  
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
function CorrectionScreen(props) {

  // 부모(AiSecretary)에서 내려준 props 꺼내기
  const correction = props.correction;
  const setCorrection = props.setCorrection;
  const onBackHome = props.onBackHome;

  return (
    <div style={styles.page}>
      {/* 상단 헤더 (제목+설명 / 다른 기능 선택 버튼) */}
      <div style={{ 
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20
      }}>
        <div>
          <div style={{ fontSize: 16, color: C.sub, fontWeight: 700 }}>
            AI 비서
          </div>

          <h1 style={{
            margin: "6px 0 0",
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: -1
          }}>
            메일 문구 교정
          </h1>

          <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 16 }}>
            메일 문구를 더 자연스럽고 명확하게 교정해 드립니다.
          </p>
        </div>

        <AppButton variant="secondary" onClick={onBackHome}>
          다른 기능 선택
        </AppButton>  
      </div>    
      
      {/* 본문 3열 레이아웃 (채팅 영역/ 교정 옵션/ 원문+결과 비교) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "300px 260px minmax(0, 1fr)",
        gap: 16,
        alignItems: "start"
      }}>

        {/* 1) 채팅 영역 - AI 안내 메시지/ 사용자 요청 메시지/ 입력창 */}
        <div style={{
          ...styles.card,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          minHeight: 680
        }}>
          {/* 카드 상단 제목 */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <h3 style={styles.sectionTitle}>메일 문구 교정</h3>
            {/* 새로고침/ 초기화 느낌의 아이콘 - 추후 기능 적용 */}
            <Icon color={C.sub}>{I.refresh}</Icon>
          </div>

          {/* 대화 미리보기 영역 - 백 연결 시 수정 예정, 현 미리보기용 */}
          <div style={{
            display: "grid",
            gap: 16,
            marginTop: 18,
            flex: 1
          }}>
            {/* AI 첫 안내 메시지 예시 */}
            <Bubble
              role="ai"
              text={"안녕하세요! 문구를 더 정중하게 다듬어드릴게요. \n교정할 메일 내용을 입력해 주세요."}
              time="오전 10:30"
            />

            {/* 사용자 메시지 예시 */}
            <Bubble
              role="user"
              text={"아래 메일 내용을 검토해 주시고..."}
              time="오전 10:31"
            />
          </div>

          {/* 실제 입력창 영역 - textarea/ 첨부 아이콘/ 전송 버튼 */}
          <div style={{ marginTop: 16 }}>
            <div style={{
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 12,
              minHeight: 112,
              display: "flex",
              flexDirection: "column"
            }}>
              {/* textarea : 사용자 교정 내용 입력 */}
              <textarea
                placeholder="수정사항을 입력해주세요"
                style={{
                  flex: 1,
                  resize: "none",
                  border: "none",
                  outline: "none",
                  fontSize: 14
                }} />

              {/* 입력창 하단 액션 영역 - 첨부파일/ 전송 버튼 */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                {/* 첨부파일 아이콘 */}
                <Icon color={C.sub}>{I.clip}</Icon>
                
                {/* 전송 버튼 */}
                <button style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "none",
                  background: C.accent,
                  color: "#fff",
                  cursor: "pointer"
                }}>
                  <Icon color="#fff">{I.send}</Icon>
                </button>
              </div>  
            </div>

            {/* 입력 안내 */}
            <div style={{ marginTop: 10, fontSize: 12, color: C.muted }}>
                Enter로 전송, Shift+Enter로 줄바꿈
            </div>
          </div>     
        </div>

        {/* 2) 교정 옵션 영역 - tone/ strength/ length/ spellcheck */}
        <div style={{ ...styles.card, padding: 20 }}>
          <h3 style={styles.sectionTitle}>교정 옵션</h3>
          
          <div style={{ display: "grid", gap: 22, marginTop: 18 }}>
            {/* 톤 선택(tone) - selected={correction.tone} */}
            <OptionGroup 
              label="톤"
              options={["공손", "중립", "설득형"]}
              selected={correction.tone}
              onChange={(v) =>
                setCorrection((prev) => ({
                ...prev,
                tone: v
                }))
              }
            />

            {/* 수정 강도 선택(strength) */}
            <OptionGroup
              label="수정 강도"
              options={["가볍게", "보통", "강하게"]}
              selected={correction.strength}
              onChange={(v) =>
                setCorrection((prev) => ({
                  ...prev,
                  strength: v
                }))
              }
            />

            {/* 길이 조절 선택 */}
            <OptionGroup
              label="길이 조절"
              options={["축약", "유지", "확장"]}
              selected={correction.length}
              onChange={(v) =>
                setCorrection((prev) => ({
                  ...prev,
                  length: v
                }))
              }
            />

            {/* 맞춤법 보정 토글 - spellCheck 값에 따라 on/off처럼 보이게 처리 */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
                맞춤법 보정
              </div>

              <button
                onClick={() => 
                  setCorrection((prev) => ({
                    ...prev,
                    spellCheck: !prev.spellCheck
                  }))
                }
                style={{
                  width: 52,
                  height: 30,
                  borderRadius: 999,
                  border: "none",
                  background: correction.spellCheck ? C.accent : "#CBD5E1",
                  position: "relative",
                  cursor: "pointer"
                }}
              >
                {/* 토글 내부 원형 핸들 */}
                <span style={{
                  position: "absolute",
                  top: 3,
                  left: correction.spellCheck ? 26 : 3,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "0.15s ease"
                }} />
              </button>
            </div>

            {/* 옵션 적용 버튼 */}
            <AppButton style={{ width: "100%" }}>
                이 옵션으로 다시 교정
            </AppButton>

            {/* 옵션 설명 */}
            <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>
                교정 옵션은 채팅 화면 안에서 바로 조절합니다.
            </div>
          </div>
        </div>

        {/* 3) 원문/ 교정 결과 비교 영역 - 상단 헤더/ 보기 방식 탭/ CompareCard 2개 */}
        <div style={{
          ...styles.card,
            width: "100%",
            maxWidth: 980,
            justifySelf: "start",
            overflow: "hidden",
        }}>
          {/* 상단 헤더 */}
          <div style={{
            padding: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${C.border}`
          }}>
            <h3 style={{ ...styles.sectionTitle, fontSize: 16 }}>
              원문 / 교정 결과 비교
            </h3>

            {/* 복사 버튼 */}
            <div style={{ display: "flex", gap: 10 }}>
              <AppButton variant="secondary" style={{ height: 40 }}>
                <Icon>{I.copy}</Icon>
                복사
              </AppButton>
            </div>
          </div>

          {/* 보기 모드 탭 */}
          <div style={{ padding: "0 20px" }}>
            <div style={{
              display: "flex",
              gap: 24,
              height: 58,
              alignItems: "center"
            }}>
              {/* 현재 활성 탭 : 나란히 보기 */}
              <div style={{
                color: C.accent,
                fontWeight: 800,
                borderBottom: `3px solid ${C.accent}`,
                paddingBottom: 13
              }}>
                나란히 보기
              </div>

              <div style={{ color: C.sub, fontWeight: 700 }}>
                변경점 보기
              </div>
            </div>
          </div>

          {/* 비교 카드 영역 - 원문 + 비교 배지 + 교정 결과 */}
          <div style={{
            padding: 20,
            display: "grid",
            gridTemplateColumns: "minmax(280px, 420px) 68px minmax(280px, 420px)",
            gap: 14,
            justifyContent: "center",
            alignItems: "start"
          }}>
            {/* 왼쪽: 원문 카드 */}
            <CompareCard 
              title="원문"
              body={[
                "안녕하세요, 000 대리님",
                "요청하신 자료를 첨부와 같이 전달드립니다.",
                "자료 검토 후 의견 주시면 반영하겠습니다.",
                "감사합니다.",
                "000 드림"
              ]}
            />

            {/* 가운데: 비교 배치 */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
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

            {/* 오른쪽: 교정문 결과 카드 */}
            <CompareCard 
              title="교정 결과"
              accent
              body={[
                "안녕하세요, 000 대리님",
                "요청하신 자료를 첨부와 같이 전달드립니다.",
                "검토 후 의견을 주시면 반영하여 개선하겠습니다.",
                "감사합니다.",
                "000 드림"
              ]}
            />
          </div>

          {/* 하단 안내문 */}
          <div style={{
            padding: 20,
            borderTop: `1px solid ${C.border}`,
            color: C.sub,
            fontSize: 13
          }}>
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
function TemplateScreen(props) {
  // 부모(AiSecretary)에서 내려준 props 꺼내기
  const onStartTemplate = props.onStartTemplate;

  // 테스트 시에만 사용하는 로컬 상태 - 추후 백단 연결 시 수정 예정
  const [filters, setFilters] = useState({
    category: "",
    dept: "",
    situation: "",
    tone: "공식적",
    title: true,
    paragraphs: true,
    signature: true,
  });

  return (
    <div style={styles.page}>
      {/* 상단 헤더 */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 16, color: C.sub, fontWeight: 700 }}>AI 비서</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 38, fontWeight: 900, letterSpacing: -1 }}>템플릿 추천</h1>
        <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 16 }}>
          조건에 맞는 관리자 제공 템플릿을 추천받아 빠르게 시작합니다.
        </p>
      </div>

      {/* 상단 유형 탭 표시 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12, marginBottom: 18 }}>
        {["report", "minutes", "approval", "mail", "template"].map((tab) => {
          const active = tab === "template";
          const icon =
            tab === "report"
              ? I.file
              : tab === "minutes"
              ? I.users
              : tab === "approval"
              ? I.check
              : tab === "mail"
              ? I.mail
              : I.spark;

          return (
            <div
              key={tab}
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
              }}
            >
              <Icon>{icon}</Icon>
              {docMeta[tab].label}
            </div>
          );
        })}
      </div>

      {/* 정책 안내 카드 */}
      <div style={{ ...styles.card, padding: 18, marginBottom: 18, background: "#F7FAFF" }}>
        <div style={{ color: C.accent, fontWeight: 900, fontSize: 15 }}>
          사용자는 조건을 선택하고, 관리자가 미리 등록한 템플릿을 추천받아 사용할 수 있습니다.
        </div>
        <div style={{ marginTop: 8, color: C.sub, fontSize: 14 }}>
          문서 카테고리, 상황, 톤앤매너 등을 선택하면 조건에 맞는 템플릿을 추천해 드립니다.
        </div>
      </div>

      {/* 본문 2열 (좌: 템플릿 조건 선택/ 우: 관리자 제공 템플릿 목록) */}
      <div style={{ display: "grid", gridTemplateColumns: "440px 1fr", gap: 18 }}>
        {/* 좌: 템플릿 조건 선택 카드 */}
        <div style={{ ...styles.card, padding: 22 }}>
          <h3 style={styles.sectionTitle}>템플릿 조건 선택</h3>
          <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
            {/* 문서 카테고리 입력 */}
            <TextInput
              placeholder="예) 보고, 안내, 요청, 공지, 인사 등"
              value={filters.category}
              onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
            />

            {/* 부서 입력 */}
            <TextInput
              placeholder="부서를 선택하세요"
              value={filters.dept}
              onChange={(e) => setFilters((p) => ({ ...p, dept: e.target.value }))}
            />

            {/* 상황 입력 */}
            <TextInput
              placeholder="예) 주간 업무 공유, 외부 협조 요청 등"
              value={filters.situation}
              onChange={(e) => setFilters((p) => ({ ...p, situation: e.target.value }))}
            />

            {/* 톤앤매너 선택 */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>톤앤매너</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["공식적", "친근함", "간결함"].map((tone) => (
                  <Chip key={tone} active={filters.tone === tone} onClick={() => setFilters((p) => ({ ...p, tone }))}>
                    {tone}
                  </Chip>
                ))}
              </div>
            </div>

            {/* 체크 옵션 */}
            {[
              ["title", "제목 포함", "문서의 목적을 드러내는 제목을 포함합니다."],
              ["paragraphs", "기본 문단 포함", "도입, 본문, 마무리 등 기본 문단 구성을 포함합니다."],
              ["signature", "서명 포함", "작성자/부서/연락처 등 서명 영역을 포함합니다."],
            ].map(([key, label, desc]) => (
              <label key={key} style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={filters[key]}
                  onChange={(e) => setFilters((p) => ({ ...p, [key]: e.target.checked }))}
                  style={{ marginTop: 3 }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{label}</div>
                  <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>{desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* 추천 템플릿 보기 */}
          <AppButton style={{ width: "100%", marginTop: 20 }}>
            <Icon>{I.spark}</Icon>
            추천 템플릿 보기
          </AppButton>
        </div>

        {/* 우: 관리자 제공 템플릿 목록 */}
        <div style={{ ...styles.card, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h3 style={styles.sectionTitle}>관리자 제공 템플릿</h3>
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
              조건에 맞는 템플릿 추천
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {templateCards.map((card) => (
              <div key={card.id} style={{ ...styles.card, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{card.title}</div>
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
                <div style={{ marginTop: 10, fontSize: 14, color: C.sub, lineHeight: 1.6 }}>
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

                {/* 카드 선택 시 부모에게 알려서 다음 화면으로 이동 */}
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
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// WriterScreen: 실질적인 AI 초안 작성/수정 작업 화면
// 생성된 초안을 확인하고
// AI와 대화하며 수정 요청을 보내고, 문서 미리보기와 변경 이력을 통해 초안을 점진적으로 다듬는 화면
function WriterScreen(props) {
  // 부모(AiSecretary)에서 내려준 props 꺼내기
  const writerState = props.writerState;
  const setWriterState = props.setWriterState;

  // 현재 버전 목록
  const versions = writerState.versions;

  // 채팅 입력 후 문서 수정 요청을 반영
  // 사용자 메시지 추가 / AI 응답 메시지 추가/ 새 버전(version) 하나 추가
  const addMessage = () => {
    if (!writerState.prompt.trim()) return;

    // 사용자 메시지 추가
    const nextMessage = {
      role: "user",
      text: writerState.prompt,
      time: "10:16 AM"
    };

    // AI 응답 메시지 추가
    const aiMessage = {
      role: "ai",
      text: "요청하신 내용에 맞게 결론을 간결하게 수정하여 초안을 업데이트했습니다.",
      time: "10:17 AM",
    };
    
    // 새 버전(version) 하나 추가
    const nextVersion = {
      id: `v${versions.length + 1}`,
      title: versions.length + 1 === 3 ? "팀장 보고용 톤 반영" : "추가 수정",
      summary: writerState.prompt,
      current: true,
    };

    setWriterState((prev) => ({
      ...prev,
      chat: [...prev.chat, nextMessage, aiMessage],
      prompt: "",
      versions: [
        ...prev.versions.map((v) => ({
          ...v, current: false
        })),
        nextVersion],
    }));
  };

  return (
    <div style={{
      ...styles.page,
      paddingRight: writerState.showHistory ? 12 : 28
    }}>
      {/* 상단 제목 영역 */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 38, fontWeight: 900, letterSpacing: -1 }}>AI 비서 · 문서 작성</h1>
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
            보고서 초안
          </div>
        </div>
        <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 16 }}>
          생성된 초안입니다. 필요에 따라 수정하거나 재생성할 수 있습니다.
        </p>
      </div>

      {/* 본문 레이아웃 (좌: AI와 대화/ 가운데: 문서 본문/ 우: 변경 이력(showHistory=true일 때만)) */}      
      <div style={{
        display: "grid",
        gridTemplateColumns: writerState.showHistory ? "300px 1fr 280px" : "300px 1fr",
        gap: 16
      }}>
        {/* 좌: AI와 대화 */}
        <div style={{
          ...styles.card,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          minHeight: 760
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={styles.sectionTitle}>AI와 대화</h3>
          </div>

          {/* 채팅 메시지 리스트 */}
          <div style={{ marginTop: 18, flex: 1, display: "grid", gap: 16, alignContent: "start" }}>
            {writerState.chat.map((msg, idx) => (
              <Bubble
                key={`${msg.time}-${idx}`}
                role={msg.role}
                text={msg.text}
                time={msg.time}
              />
            ))}

            {/* 문서 미리보기 카드 - 백 연결 후 수정 예정 */}
            <div style={{ ...styles.card, padding: 14, borderRadius: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>3분기 마케팅 성과 보고서 초안</div>
              <div style={{ marginTop: 8, fontSize: 12, color: C.sub }}>최근 수정 · 10:17 AM</div>
              <div style={{ marginTop: 8, color: C.accent, fontWeight: 800, fontSize: 13 }}>미리보기</div>
            </div>
          </div>

          {/* 수정 요청 입력창 */}
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
                onChange={(e) => setWriterState((prev) => ({ ...prev, prompt: e.target.value }))}
                placeholder="수정 요청을 입력하세요..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 14 }}
              />
              <button
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

       {/* 가운데 문서 본문 패널 */}
        <div style={{ ...styles.card, overflow: "hidden" }}>
          <div style={{ padding: 18, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <div
                style={{
                  height: 36,
                  padding: "0 12px",
                  borderRadius: 999,
                  background: C.softGreen,
                  color: C.success,
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: 13,
                  fontWeight: 800,
              }}>
                자동 저장됨
              </div>

              <AppButton
                variant="secondary"
                style={{ height: 36 }}
                onClick={() => setWriterState((prev) => ({ ...prev, showHistory: !prev.showHistory }))}
              >
                <Icon>{I.history}</Icon>
                변경 이력
              </AppButton>

              <AppButton variant="secondary" style={{ height: 36 }}>
                선택 문단 재생성
              </AppButton>

              <AppButton style={{ height: 36 }}>전체 재생성</AppButton>
            </div>

            {/* 재생성 설명 안내 */}
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
              재생성은 문서를 새로 쓰는 것이 아니라, 현재 입력과 옵션을 기준으로 다시 생성하는 기능입니다.
            </div>
          </div>

          {/* 문서 본문 */}    
          <div style={{ padding: 22 }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>3분기 마케팅 성과 보고서 초안</div>
            <div style={{ marginTop: 24, lineHeight: 1.85, fontSize: 15 }}>
              <Section title="1. 개요">
                본 보고서는 2024년 3분기 마케팅 활동의 성과를 요약하고, 주요 인사이트와 향후 방향성을 제시하기 위해 작성되었습니다.
              </Section>
              <Section title="2. 주요 성과">
                • 전체 캠페인 성과: 전분기 대비 매출 18% 증가, 신규 리드 24% 증가<br />
                • 주요 채널 성과: 검색 광고 효율 26% 개선, SNS 도달 32% 증가<br />
                • 브랜드 지표: 브랜드 인지도 8%p 상승, 고객 선호도 6%p 상승
              </Section>

              {/* 선택 문단 강조 박스 */}
              <div
                style={{
                  border: `2px solid ${C.accent}`,
                  borderRadius: 14,
                  padding: 18,
                  position: "relative",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    right: 12,
                    background: C.accent,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 800,
                    borderRadius: 999,
                    padding: "5px 10px",
                  }}
                >
                  선택 문단
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>3. 결론</div>
                3분기 마케팅 활동은 전반적으로 긍정적인 성과를 달성했습니다.<br />
                핵심 채널의 효율 개선과 신규 캠페인의 성과가 매출과 리드 성장에 기여했습니다.<br />
                4분기에는 콘텐츠 고도화와 타겟 세분화를 통해 성과를 더욱 확대하겠습니다.
              </div>
              <Section title="4. 향후 계획">
                • 핵심 캠페인 지속 운영 및 예산 효율화<br />
                • 데이터 기반 타겟 세분화 및 개인화 강화<br />
                • 크로스 채널 연계 캠페인 확대
              </Section>
            </div>
          </div>

          {/* 하단 상태바 */}        
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
            <div>글자 수 1,248자 | 페이지 수 A4 3페이지(예상)</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div>100%</div>
              <AppButton variant="secondary" style={{ height: 34 }}>전체화면</AppButton>
            </div>
          </div>
        </div>

        {/* 우측: 변경 이력 패널 */}    
        {writerState.showHistory && (
          <div style={{ ...styles.card, padding: 20, minHeight: 760 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={styles.sectionTitle}>버전 기록</h3>
              <button
                onClick={() => setWriterState((prev) => ({ ...prev, showHistory: false }))}
                style={{ border: "none", background: "transparent", fontSize: 20, cursor: "pointer", color: C.sub }}
              >
                ×
              </button>
            </div>
            <div style={{ ...styles.sectionSub, marginTop: 10 }}>
              이전 버전을 미리보기하고, 원하는 버전으로 복원할 수 있습니다.
            </div>

            <div style={{ marginTop: 22, display: "grid", gap: 16 }}>
              {versions
                .slice()
                .reverse()
                .map((version) => (
                  <div key={version.id} style={{ ...styles.card, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
                    <div style={{ marginTop: 12, fontWeight: 900 }}>{version.title}</div>
                    <div style={{ marginTop: 8, fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{version.summary}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <AppButton variant="secondary" style={{ flex: 1 }}>미리보기</AppButton>
                      <AppButton style={{ flex: 1 }}>이 버전으로 복원</AppButton>
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
    { role: "ai", text: "사내 규정이나 업무 절차에 대해 무엇이든 질문해 주세요.", time: "오전 9:10" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: input, time: "오전 9:11" },
      { role: "ai", text: "관련 정보를 사내 문서에서 검색해 답변을 준비 중입니다.", time: "오전 9:11" },
    ]);
    setInput("");
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, color: C.sub, fontWeight: 700 }}>AI 챗봇</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 38, fontWeight: 900, letterSpacing: -1 }}>사내 지식 검색</h1>
      </div>

      <div style={{ ...styles.card, padding: 20, minHeight: 720, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "grid", gap: 16, alignContent: "start" }}>
          {messages.map((msg, idx) => (
            <Bubble key={`${msg.time}-${idx}`} role={msg.role} text={msg.text} time={msg.time} />
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
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14 }}
          />
          <button
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


// 흐름제어 컴포넌트 (화면X) ---------------------------------------------
// AiSecretaryPrototype(AiSecretary): AI 비서 상위 흐름 제어 컴포넌트
// 1) 탭 전환, 화면 전환, 문서 유형, 입력 데이터, 교정 옵션, 작성 상태 등을 관리
// 2) 현재 상태에 맞는 하위 화면을 렌더링하는 최상위 컨트롤 컴포넌트
export default function AiSecretary() {
  const [tab, setTab] = useState("assistant");
  const [screen, setScreen] = useState("assistant-home");
  const [formType, setFormType] = useState("report");
  const [formData, setFormData] = useState(initialFormData);
  const [correction, setCorrection] = useState(initialCorrection);
  const [writerState, setWriterState] = useState(initialWriterState);
  const [recents] = useState(recentDocsSeed);

  const page = useMemo(() => {
    if (tab === "chatbot") return <ChatbotScreen />;

    if (screen === "assistant-home") {
      return (
        <AssistantHome
          onOpenForm={(type) => {
            setFormType(type);
            setScreen("form");
          }}
          onOpenCorrection={() => setScreen("correction")}
          onOpenTemplate={() => setScreen("template")}
        />
      );
    }

    if (screen === "form") {
      return (
        <StartFormScreen
          formType={formType}
          formData={formData}
          onChangeFormType={setFormType}
          onChangeFormData={(key, value) => setFormData((prev) => ({ ...prev, [key]: value }))}
          onGenerateDraft={() => setScreen("writer")}
          onOpenCorrection={() => setScreen("correction")}
          onOpenTemplate={() => setScreen("template")}
        />
      );
    }

    if (screen === "correction") {
      return <CorrectionScreen correction={correction} setCorrection={setCorrection} onBackHome={() => setScreen("assistant-home")} />;
    }

    if (screen === "template") {
      return (
        <TemplateScreen
          onStartTemplate={(card) => {
            if (card.targetType === "mail") {
              setScreen("correction");
              return;
            }
            setFormType(card.targetType || "report");
            setFormData((prev) => ({ ...prev, title: card.title }));
            setScreen("form");
          }}
        />
      );
    }

    if (screen === "writer") {
      return <WriterScreen writerState={writerState} setWriterState={setWriterState} />;
    }

    return null;
  }, [tab, screen, formType, formData, correction, writerState]);

  return (
    <div style={styles.app}>
      <Sidebar
        tab={tab}
        onTabChange={(next) => {
          setTab(next);
          if (next === "assistant") setScreen("assistant-home");
        }}
        onNewDoc={() => {
          setTab("assistant");
          setScreen("assistant-home");
        }}
        recents={recents}
        onRecentClick={(doc) => {
          setTab("assistant");
          if (doc.screen === "writer") setScreen("writer");
          else {
            setFormType(doc.type || "report");
            setScreen("form");
          }
        }}
      />
      <main style={styles.main}>{page}</main>
    </div>
  );
}