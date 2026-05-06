/* AiSecretary.js 전용 실질적인 AI 초안 작성/수정 작업 화면 */
// src/pages/aiSecretary/screens/WriterScreen.js

/*
  WriterScreen 역할
  --------------------------------------------------
  1. AI가 생성한 초안 문서를 화면에 표시
  2. 사용자가 추가 수정 요청을 입력하면 /assistant/revise API 호출
  3. 수정된 문서를 writerState.content에 반영
  4. 각 수정 결과를 versions에 content와 함께 저장
  5. 버전 미리보기 / 복원 / 복사 / 다운로드 기능 제공

*/

import React, { useRef, useState } from "react";
import AppButton from "../components/AppButton";
import Bubble from "../components/Bubble";
import { I, Icon } from "../constants/aiSecretaryIcons";
import { C, styles } from "../styles/aiSecretaryTheme";
import { reviseAssistantDraft, unwrapApiData } from "../api/aiSecretaryApi";

/**
 * 문서 유형별 화면 메타 정보
 *
 * 기존 documentMap은 정적 목업 문서 전체를 들고 있었지만,
 * 실제 Gemini 초안 생성이 연결된 이후에는 chipLabel, fallbackTitle 정도만 필요하다.
 */
const DOCUMENT_META_MAP = {
  report: {
    chipLabel: "보고서 초안",
    fallbackTitle: "보고서 초안",
  },
  minutes: {
    chipLabel: "회의록 정리",
    fallbackTitle: "회의록",
  },
  approval: {
    chipLabel: "결재 사유",
    fallbackTitle: "결재 사유",
  },
};

export default function WriterScreen({
  writerState = {},
  setWriterState,
  writerType = "report",
}) {
  /**
   * writerState 안전 처리
   * --------------------------------------------------
   * writerState.chat / writerState.versions가 undefined인 경우에도
   * 화면이 깨지지 않도록 배열 보정
   */
  const chatMessages = Array.isArray(writerState?.chat)
    ? writerState.chat
    : [];

  const versions = Array.isArray(writerState?.versions)
    ? writerState.versions
    : [];

  /**
   * 현재 미리보기 중인 버전 ID
   * --------------------------------------------------
   * - 현재 버전(current)이 있으면 해당 버전을 기본 미리보기 대상으로 설정
   * - 없으면 마지막 버전
   * - 아무 버전도 없으면 null
   */
  const [previewVersionId, setPreviewVersionId] = useState(
    versions.find((v) => v.current)?.id ||
      versions[versions.length - 1]?.id ||
      null
  );

  const [actionMessage, setActionMessage] = useState("");
  const [isRevising, setIsRevising] = useState(false);

  /**
   * 안내 메시지 타이머 관리
   * --------------------------------------------------
   * 기존 showActionMessage._timer 방식은 렌더링마다 함수가 새로 생성되어
   * 타이머 관리가 불안정할 수 있으므로 useRef로 관리한다.
   */
  const actionTimerRef = useRef(null);

  const currentDoc = DOCUMENT_META_MAP[writerType] || DOCUMENT_META_MAP.report;
  const isApprovalDocument = writerType === "approval";

  /**
   * 실제 문서 표시 데이터 계산
   * --------------------------------------------------
   * draftTitle:
   * - writerState.title이 있으면 실제 문서 제목
   * - 없으면 문서 유형별 fallbackTitle
   *
   * draftContent:
   * - writerState.content가 있으면 실제 Gemini 생성/수정 문서
   * - 없으면 안내 문구
   */
  const fallbackContent =
    "아직 생성된 초안이 없습니다. 문서 작성 시작 화면에서 AI 초안을 먼저 생성해 주세요.";

  const draftTitle =
    writerState?.title || currentDoc.fallbackTitle || "AI 초안";

  const draftContent =
    writerState?.content || fallbackContent;

  /**
   * 버전 미리보기 계산
   * --------------------------------------------------
   * previewVersionId가 선택되어 있고 해당 버전에 content가 있으면,
   * 오른쪽 문서 영역에는 해당 버전의 content를 보여준다.
   *
   * 없으면 현재 writerState.content를 보여준다.
   */
  const previewVersion = versions.find((v) => v.id === previewVersionId);

  const displayContent =
    previewVersion?.content || draftContent;

  const displayTitle =
    writerState?.title || draftTitle;

  const displayStats =
    `글자 수 ${(displayContent || "").length.toLocaleString()}자`;

  /**
   * 상단/하단 액션 메시지 표시
   */
  const showActionMessage = (message) => {
    setActionMessage(message);

    if (actionTimerRef.current) {
      window.clearTimeout(actionTimerRef.current);
    }

    actionTimerRef.current = window.setTimeout(() => {
      setActionMessage("");
    }, 2000);
  };

  /**
   * 버전 미리보기
   * --------------------------------------------------
   * 실제 writerState.content를 바꾸지는 않고,
   * 오른쪽 본문 표시만 해당 버전 content로 변경한다.
   */
  const handlePreviewVersion = (versionId) => {
    setPreviewVersionId(versionId);
  };

  /**
   * 버전 복원
   * --------------------------------------------------
   * 선택한 버전의 content를 writerState.content에 반영한다.
   * 즉, 복원은 미리보기와 달리 실제 현재 문서 상태를 바꾼다.
   */
  const handleRestoreVersion = (versionId) => {
    setWriterState((prev) => {
      const safeVersions = Array.isArray(prev?.versions)
        ? prev.versions
        : [];

      const selectedVersion = safeVersions.find((v) => v.id === versionId);

      return {
        ...prev,
        content: selectedVersion?.content ?? prev.content,
        versions: safeVersions.map((v) => ({
          ...v,
          current: v.id === versionId,
        })),
      };
    });

    setPreviewVersionId(versionId);
    showActionMessage(`${versionId} 버전으로 복원했습니다.`);
  };

  /**
   * AI 추가 수정 요청
   * --------------------------------------------------
   * 사용자가 "더 간결하게", "표로 정리해줘" 등을 입력하면
   * 현재 화면에 표시 중인 문서(displayContent)를 기준으로 /assistant/revise API 호출.
   *
   * 성공 시:
   * - writerState.content를 수정된 문서로 교체
   * - versions에 새 버전 content 저장
   * - 채팅 영역에 사용자 요청/AI 응답 표시
   */
  const addMessage = async () => {
    const instruction = (writerState?.prompt || "").trim();

    if (!instruction) return;
    if (isRevising) return;

    if (!writerState?.sessionId) {
      showActionMessage("수정할 문서 세션 정보가 없습니다.");
      return;
    }

    if (!writerState?.content) {
      showActionMessage("먼저 AI 초안을 생성해 주세요.");
      return;
    }

    const userMessage = {
      role: "user",
      text: instruction,
      time: "방금",
    };

    setIsRevising(true);

    /**
     * 사용자 메시지는 먼저 화면에 반영한다.
     * 실제 AI 응답은 API 성공 후 추가한다.
     */
    setWriterState((prev) => {
      const safeChat = Array.isArray(prev?.chat) ? prev.chat : [];

      return {
        ...prev,
        chat: [...safeChat, userMessage],
        prompt: "",
      };
    });

    try {
      const response = await reviseAssistantDraft({
        sessionId: writerState.sessionId,
        type: writerType,
        title: displayTitle,
        currentContent: displayContent,
        instruction,
      });

      const data = unwrapApiData(response);

      const revisedContent = data?.content || displayContent;

      const aiMessage = {
        role: "ai",
        text: data?.fallback
          ? "AI 응답 생성이 원활하지 않아 기본 안내 응답을 반영했습니다."
          : "요청하신 내용에 맞게 문서를 업데이트했습니다.",
        time: "방금",
      };

      /**
       * 새 버전 ID는 현재 versions 기준으로 생성한다.
       * isRevising으로 중복 클릭을 막고 있으므로 일반 사용 흐름에서는 안정적이다.
       */
      const nextVersion = {
        id: `v${versions.length + 1}`,
        title: "추가 수정",
        summary: instruction,
        content: revisedContent,
        current: true,
      };

      setWriterState((prev) => {
        const safeChat = Array.isArray(prev?.chat) ? prev.chat : [];
        const safeVersions = Array.isArray(prev?.versions)
          ? prev.versions
          : [];

        return {
          ...prev,
          content: revisedContent,
          aiMessageId: data?.aiMessageId ?? prev.aiMessageId,
          modelName: data?.modelName ?? prev.modelName,
          fallback: data?.fallback ?? prev.fallback,
          chat: [...safeChat, aiMessage],
          versions: [
            ...safeVersions.map((v) => ({ ...v, current: false })),
            nextVersion,
          ],
        };
      });

      setPreviewVersionId(nextVersion.id);
    } catch (error) {
      console.error("AI 문서 수정 실패", error);

      const aiMessage = {
        role: "ai",
        text: "문서 수정 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        time: "방금",
      };

      setWriterState((prev) => {
        const safeChat = Array.isArray(prev?.chat) ? prev.chat : [];

        return {
          ...prev,
          chat: [...safeChat, aiMessage],
        };
      });
    } finally {
      setIsRevising(false);
    }
  };

  /**
   * 현재 표시 중인 문서 복사
   * --------------------------------------------------
   * 미리보기 중인 버전이 있으면 해당 버전 content를 복사한다.
   */
  const handleCopy = async () => {
    const textToCopy = `${displayTitle}\n\n${displayContent}`;

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

  /**
   * 현재 표시 중인 문서 다운로드
   */
  const handleDownload = () => {
    const blob = new Blob([`${displayTitle}\n\n${displayContent}`], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${displayTitle || "AI_초안"}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showActionMessage("문서 다운로드가 시작되었습니다.");
  };

  /**
   * 전자결재 내보내기
   * --------------------------------------------------
   * 아직 실제 전자결재 API와 연결하지 않았으므로,
   * 현재는 버전 기록에 내보내기 기록만 남긴다.
   */
  const handleExportToApproval = () => {
    const nextVersion = {
      id: `v${versions.length + 1}`,
      title: "전자결재 내보내기",
      summary: "문서를 전자결재 > 임시보관함으로 내보냈습니다.",
      content: displayContent,
      current: true,
    };

    setWriterState((prev) => {
      const safeVersions = Array.isArray(prev?.versions)
        ? prev.versions
        : [];

      return {
        ...prev,
        content: displayContent,
        showHistory: true,
        versions: [
          ...safeVersions.map((v) => ({ ...v, current: false })),
          nextVersion,
        ],
      };
    });

    setPreviewVersionId(nextVersion.id);
    showActionMessage("전자결재 > 임시보관함에 문서가 저장되었습니다.");
  };

  return (
    <div
      style={{
        ...styles.page,
        paddingRight: writerState?.showHistory ? 12 : 28,
      }}
    >
      {/* 상단 제목 영역 */}
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
          gridTemplateColumns: writerState?.showHistory
            ? "300px 1fr 280px"
            : "300px 1fr",
          gap: 16,
        }}
      >
        {/* 좌측: AI와 대화 영역 */}
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
            {chatMessages.map((msg, idx) => (
              <Bubble
                key={`${msg.time}-${idx}`}
                role={msg.role}
                text={msg.text}
                time={msg.time}
              />
            ))}

            <div style={{ ...styles.card, padding: 14, borderRadius: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>
                {displayTitle}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: C.sub }}>
                최근 수정 · 방금
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

          {/* 수정 요청 입력 영역 */}
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
                value={writerState?.prompt || ""}
                onChange={(e) =>
                  setWriterState((prev) => ({
                    ...prev,
                    prompt: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMessage();
                  }
                }}
                disabled={isRevising}
                placeholder={
                  isRevising
                    ? "AI가 문서를 수정하는 중입니다..."
                    : "수정 요청을 입력하세요..."
                }
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  background: "transparent",
                  color: "#111827",
                  caretColor: "#111827",
                  WebkitTextFillColor: "#111827",
                }}
              />

              <button
                type="button"
                onClick={addMessage}
                disabled={isRevising}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  background: C.accent,
                  color: "#fff",
                  cursor: isRevising ? "default" : "pointer",
                  opacity: isRevising ? 0.6 : 1,
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

        {/* 중앙: 문서 미리보기 영역 */}
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
              {displayTitle}
            </div>

            <div style={{ marginTop: 24, lineHeight: 1.85, fontSize: 15 }}>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.85,
                  fontSize: 15,
                  color: writerState?.content ? C.text : C.sub,
                }}
              >
                {displayContent}
              </div>
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
            <div>{displayStats}</div>
          </div>
        </div>

        {/* 우측: 버전 기록 영역 */}
        {writerState?.showHistory && (
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