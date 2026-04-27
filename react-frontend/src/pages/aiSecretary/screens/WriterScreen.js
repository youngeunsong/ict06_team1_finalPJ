/* AiSecretary.js 전용 실질적인 AI 초안 작성/ 수정 작업 화면 */
// src/pages/aiSecretary/screens/WriterScreen.js

// WriterScreen: 실질적인 AI 초안 작성/수정 작업 화면
// 생성된 초안을 확인하고
// AI와 대화하며 수정 요청을 보내고, 문서 미리보기와 변경 이력을 통해 초안을 점진적으로 다듬는 화면

import React, { useState } from "react";
import AppButton from "../components/AppButton";
import Bubble from "../components/Bubble";
import Section from "../components/Section";
import { I, Icon } from "../constants/aiSecretaryIcons";
import { C, styles } from "../styles/aiSecretaryTheme";

export default function WriterScreen({
  writerState,
  setWriterState,
  writerType = "report",
}) {
  const versions = Array.isArray(writerState?.versions)
    ? writerState.versions
    : [];

  const [previewVersionId, setPreviewVersionId] = useState(
    versions.find((v) => v.current)?.id || versions[versions.length - 1]?.id || null
  );
  const [actionMessage, setActionMessage] = useState("");

  const showActionMessage = (message) => {
    setActionMessage(message);

    if (showActionMessage._timer) {
      window.clearTimeout(showActionMessage._timer);
    }

    showActionMessage._timer = window.setTimeout(() => {
      setActionMessage("");
    }, 2000);
  };

  const handlePreviewVersion = (versionId) => {
    setPreviewVersionId(versionId);
  };

  const handleRestoreVersion = (versionId) => {
    setWriterState((prev) => {
      const safeVersions = Array.isArray(prev?.versions) ? prev.versions : [];

      return {
        ...prev,
        versions: safeVersions.map((v) => ({
          ...v,
          current: v.id === versionId,
        })),
      };
    });

    setPreviewVersionId(versionId);
    showActionMessage(`${versionId} 버전으로 복원했습니다.`);
  };

  const documentMap = {
    report: {
      chipLabel: "보고서 초안",
      title: "3분기 마케팅 성과 보고서 초안",
      stats: "글자 수 1,248자 | 페이지 수 A4 3페이지(예상)",
      section1:
        "본 보고서는 2024년 3분기 마케팅 활동의 성과를 요약하고, 주요 인사이트와 향후 방향성을 제시하기 위해 작성되었습니다.",
      section2: (
        <>
          • 전체 캠페인 성과: 전분기 대비 매출 18% 증가, 신규 리드 24% 증가
          <br />• 주요 채널 성과: 검색 광고 효율 26% 개선, SNS 도달 32% 증가
          <br />• 브랜드 지표: 브랜드 인지도 8%p 상승, 고객 선호도 6%p 상승
        </>
      ),
      selectedTitle: "3. 결론",
      selectedBody: (
        <>
          3분기 마케팅 활동은 전반적으로 긍정적인 성과를 달성했습니다.
          <br />
          핵심 채널의 효율 개선과 신규 캠페인의 성과가 매출과 리드 성장에 기여했습니다.
          <br />
          4분기에는 콘텐츠 고도화와 타겟 세분화를 통해 성과를 더욱 확대하겠습니다.
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
          <br />• 핵심 안건: 프로젝트 일정 점검, 기능 우선순위 조정, 리소스 배분 검토
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
          본 교육은 현재 진행 중인 사내 AI 포털 구축 프로젝트의 프론트엔드 품질 향상에
          직접적으로 기여할 수 있습니다.
          <br />
          특히 컴포넌트 구조화, 상태 관리, 화면 전환 설계 역량을 강화하여 프로젝트
          생산성과 유지보수성을 높일 수 있습니다.
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

  const handleDownload = () => {
    const blob = new Blob([`${currentDoc.title}\n\n${currentDoc.documentText}`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentDoc.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showActionMessage("문서 다운로드가 시작되었습니다.");
  };

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
          <div style={{ padding: 18, borderBottom: `1px solid ${C.border}` }}>
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
                  자동 저장됨
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

            <div style={{ marginTop: 22, display: "grid", gap: 16 }}>
              {versions
                .slice()
                .reverse()
                .map((version) => (
                  <div
                    key={version.id}
                    style={{
                      ...styles.card,
                      padding: 16,
                      border:
                        previewVersionId === version.id
                          ? `1px solid ${C.accent}`
                          : `1px solid ${C.border}`,
                      background:
                        previewVersionId === version.id ? "#F8FBFF" : "#fff",
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
                        onClick={() => handlePreviewVersion(version.id)}
                      >
                        미리보기
                      </AppButton>

                      <AppButton
                        style={{ flex: 1 }}
                        onClick={() => handleRestoreVersion(version.id)}
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