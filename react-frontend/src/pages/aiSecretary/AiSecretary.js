/**
 * @FileName : AiSecretary.js
 * @Description : 사내 AI 포털 하위 화면을 렌더링하는 최상위 컨트롤 컴포넌트
 *                - 전체 페이지 조립기
 *                - URL 기반 화면 분기
 *                - AI 비서/챗봇/문장 다듬기/지식 요청 화면 흐름 제어
 * @Author : 송혜진
 * @Date : 2026. 04. 28
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    ----------------------------------------
 * @ 2026.04.27    송혜진        최초 생성
 * @ 2026.05.06    송혜진        더미 데이터 삭제 / DB 기반 최근 작성 목록 연결
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { PATH } from "../../constants/path";

import {
  normalizeFormType,
  buildAssistantDocPath,
  ASSISTANT_DOC_PREFIX,
} from "./utils/aiSecretaryRouteHelpers";

import {
  initialFormData,
  initialCorrectionState,
  initialWriterState,
} from "./constants/aiSecretaryInitialState";

import AssistantHome from "./screens/AssistantHome";
import StartFormScreen from "./screens/StartFormScreen";
import TemplateScreen from "./screens/TemplateScreen";
import WriterScreen from "./screens/WriterScreen";
import ChatbotScreen from "./screens/ChatbotScreen";
import CorrectionScreen from "./screens/CorrectionScreen";
import KnowledgeRequestScreen from "./screens/KnowledgeRequestScreen";

import Sidebar from "./components/Sidebar";

import {
  createAssistantDraft,
  getAssistantSessionList,
  getMessages,
  unwrapApiData,
} from "./api/aiSecretaryApi";

import { styles } from "./styles/aiSecretaryTheme";

/**
 * ASSISTANT 세션 응답을 Sidebar / AssistantHome에서 쓰는 recent 문서 형식으로 변환한다.
 *
 * 현재 한계:
 * - AI_CHAT_SESSION에 report/minutes/approval 같은 documentType 컬럼이 아직 없음
 * - 그래서 우선 type은 report로 기본 처리
 *
 * 추후 개선:
 * - AI_CHAT_SESSION.document_type 컬럼 추가
 * - 백엔드 AiChatSessionResponseDto에 documentType 추가
 * - 이 함수에서 session.documentType을 type으로 매핑
 */
const mapSessionToRecentDoc = (session) => ({
  id: String(session.sessionId),
  sessionId: session.sessionId,
  title: session.title || "제목 없는 AI 문서",
  type: "report",
  screen: "writer",
  updatedAt: session.lastMessageAt,
});

export default function AiSecretary({ userInfo }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { docId } = useParams();
  const [searchParams] = useSearchParams();

  /**
   * 화면 상태
   */
  const [formData, setFormData] = useState(initialFormData);
  const [correction, setCorrection] = useState(initialCorrectionState);
  const [writerState, setWriterState] = useState(initialWriterState);

  /**
   * 최근 작성 목록
   *
   * 기존:
   * - recentDocsSeed 기반 정적 목록
   *
   * 변경:
   * - DB의 AI_CHAT_SESSION 중 ASSISTANT 세션만 조회
   */
  const [recents, setRecents] = useState([]);
  const [loadingRecents, setLoadingRecents] = useState(false);
  const [recentError, setRecentError] = useState("");

  /**
   * AI 초안 생성 상태
   *
   * generatingDraft:
   * - AI 초안 생성 중 중복 클릭 방지
   *
   * draftError:
   * - 입력값 검증 실패 또는 API 실패 메시지
   */
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [draftError, setDraftError] = useState("");

  /**
   * 로그인 사용자 사번
   *
   * 주의:
   * - userInfo가 null이면 최근 목록 조회/초안 생성은 중단
   * - 필요하면 추후 /api/user/welcome 재조회 방식 추가 가능
   */
  const empNo = userInfo?.empNo ?? userInfo?.emp_no ?? null;

  // ------------------------------------------------
  // 1) URL 기반 현재 화면 상태 파생
  // ------------------------------------------------

  /**
   * query string의 type 값을 문서 유형으로 정규화한다.
   *
   * 예:
   * /ai-portal/assistant/new?type=report
   * /ai-portal/assistant/new?type=minutes
   * /ai-portal/assistant/new?type=approval
   */
  const queryType = normalizeFormType(searchParams.get("type"));

  /**
   * 현재 URL의 docId가 최근 작성 목록에 존재하면 해당 문서를 찾는다.
   *
   * 현재 recent.id는 sessionId 문자열이다.
   */
  const matchedRecentDoc = useMemo(() => {
    return recents.find((doc) => String(doc.id) === String(docId));
  }, [recents, docId]);

  /**
   * 현재 큰 탭 구분
   *
   * assistant:
   * - AI 비서 홈/문서 작성/템플릿/Writer
   *
   * chatbot:
   * - 사내 지식 챗봇
   *
   * polish:
   * - 문장 다듬기
   *
   * knowledge-request:
   * - 지식 추가 요청
   */
  const currentTab = useMemo(() => {
    if (location.pathname.startsWith(PATH.AI.CHATBOT)) return "chatbot";
    if (location.pathname.startsWith(PATH.AI.CORRECTION)) return "polish";

    if (location.pathname.startsWith(PATH.AI.KNOWLEDGE_REQUEST)) {
      return "knowledge-request";
    }

    return "assistant";
  }, [location.pathname]);

  /**
   * assistant 탭 내부 화면 구분
   */
  const currentScreen = useMemo(() => {
    if (location.pathname === PATH.AI.ASSISTANT) return "assistant-home";
    if (location.pathname === PATH.AI.ASSISTANT_NEW) return "form";
    if (location.pathname === PATH.AI.ASSISTANT_TEMPLATE) return "template";

    if (location.pathname.startsWith(`${ASSISTANT_DOC_PREFIX}/`)) {
      return "writer";
    }

    return "assistant-home";
  }, [location.pathname]);

  /**
   * 현재 문서 유형
   *
   * 우선순위:
   * 1. 최근 작성 목록에서 찾은 문서 type
   * 2. query string type
   * 3. normalizeFormType 내부 기본값
   */
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
  // 3) 최근 작성 목록 DB 조회
  // ------------------------------------------------

  /**
   * ASSISTANT 세션만 최근 작성 목록으로 조회한다.
   *
   * 정책:
   * - ASSISTANT 세션은 장기 보관
   * - 최근 작성 목록에 노출
   * - CHATBOT 세션은 최근 작성 목록에 노출하지 않음
   */
  useEffect(() => {
    if (!empNo) return;

    const loadAssistantRecents = async () => {
      setLoadingRecents(true);
      setRecentError("");

      try {
        const response = await getAssistantSessionList(empNo);
        const data = unwrapApiData(response) ?? [];

        const mappedRecents = Array.isArray(data)
          ? data.map(mapSessionToRecentDoc)
          : [];

        setRecents(mappedRecents);
      } catch (error) {
        console.error("최근 작성 목록 조회 실패", error);

        setRecentError("최근 작성 목록을 불러오지 못했습니다.");
        setRecents([]);
      } finally {
        setLoadingRecents(false);
      }
    };

    loadAssistantRecents();
  }, [empNo]);

  // ------------------------------------------------
  // 4) WriterScreen 진입 시 DB 메시지 로딩
  // ------------------------------------------------

  /**
   * 최근 작성 문서 클릭 또는 URL 직접 진입 시:
   *
   * /ai-portal/assistant/docs/{sessionId}?type=report
   *
   * 위와 같은 writer 화면으로 들어오면,
   * sessionId 기준으로 메시지 목록을 불러온다.
   *
   * 현재 정책:
   * - 가장 마지막 ASSISTANT 메시지를 최신 문서 본문으로 사용
   * - 모든 메시지를 좌측 AI 대화 이력으로 표시
   */
  useEffect(() => {
    if (currentScreen !== "writer") return;
    if (!docId) return;

    const sessionId = Number(docId);

    if (Number.isNaN(sessionId)) return;

    const loadWriterDocument = async () => {
      try {
        const response = await getMessages(sessionId);
        const messages = unwrapApiData(response) ?? [];

        if (!Array.isArray(messages) || messages.length === 0) {
          return;
        }

        const lastAssistantMessage = [...messages]
          .reverse()
          .find((message) => message.role === "ASSISTANT");

        const firstUserMessage = messages.find(
          (message) => message.role === "USER"
        );

        if (!lastAssistantMessage) {
          return;
        }

        const matchedDoc = recents.find(
          (doc) => Number(doc.sessionId ?? doc.id) === sessionId
        );

        setWriterState((prev) => ({
          ...prev,
          sessionId,
          title: matchedDoc?.title || prev.title || "AI 문서",
          content: lastAssistantMessage.content,
          aiMessageId: lastAssistantMessage.messageId,
          userMessageId: firstUserMessage?.messageId ?? prev.userMessageId,
          modelName: lastAssistantMessage.modelName,
          fallback: lastAssistantMessage.modelName === "gemini-fallback",

          /**
           * 좌측 AI와 대화 영역에 DB 메시지를 그대로 복원한다.
           */
          chat: messages.map((message) => ({
            role: message.role === "USER" ? "user" : "ai",
            text: message.content,
            time: "저장됨",
          })),

          /**
           * 현재는 별도 document_version 테이블이 없으므로
           * 마지막 ASSISTANT 메시지를 v1로 구성한다.
           *
           * 추후 개선:
           * - 메시지 seq_no 또는 별도 버전 테이블 기반으로 v1/v2/v3 복원 가능
           */
          versions: [
            {
              id: "v1",
              title: "저장된 문서",
              summary: "DB에서 불러온 최근 작성 문서입니다.",
              content: lastAssistantMessage.content,
              current: true,
            },
          ],

          prompt: "",
          showHistory: false,
        }));
      } catch (error) {
        console.error("AI 문서 메시지 조회 실패", error);
      }
    };

    loadWriterDocument();
  }, [currentScreen, docId, recents]);

  // ------------------------------------------------
  // 5) AI 초안 생성
  // ------------------------------------------------

  /**
   * StartFormScreen의 "AI 초안 생성" 버튼 클릭 시 실행된다.
   *
   * 처리 흐름:
   * 1. 입력값 검증
   * 2. /assistant/draft API 호출
   * 3. writerState에 응답 결과 저장
   * 4. recents에 즉시 반영
   * 5. WriterScreen으로 이동
   */
  const handleGenerateDraft = async () => {
    /**
     * 디버깅이 필요할 때만 주석 해제
     *
     * console.log("[DRAFT] 버튼 클릭됨", {
     *   userInfo,
     *   empNo,
     *   currentFormType,
     *   formData,
     *   generatingDraft,
     * });
     */

    if (generatingDraft) {
      return;
    }

    if (!empNo) {
      setDraftError("사용자 정보를 찾을 수 없습니다. 다시 로그인해 주세요.");
      return;
    }

    if (!formData.title?.trim()) {
      setDraftError("문서 제목을 입력해 주세요.");
      return;
    }

    if (!formData.detail?.trim()) {
      setDraftError("핵심 내용을 입력해 주세요.");
      return;
    }

    setGeneratingDraft(true);
    setDraftError("");

    try {
      const response = await createAssistantDraft({
        empNo: String(empNo),
        type: currentFormType,
        title: formData.title,
        purpose: formData.purpose,
        audience: formData.audience,
        targets: formData.targets,
        detail: formData.detail,
        amount: formData.amount,
        tone: "BUSINESS",
      });

      const data = unwrapApiData(response);

      setWriterState((prev) => ({
        ...prev,
        sessionId: data.sessionId,
        userMessageId: data.userMessageId,
        aiMessageId: data.aiMessageId,
        type: data.type,
        title: data.title,
        content: data.content,
        modelName: data.modelName,
        fallback: data.fallback,

        /**
         * WriterScreen 좌측 AI 대화 영역 초기 메시지
         */
        chat: [
          {
            role: "user",
            text: "초안 생성을 요청했습니다.",
            time: "방금",
          },
          {
            role: "ai",
            text: data.fallback
              ? "AI 응답 생성이 원활하지 않아 기본 안내 응답을 반영했습니다."
              : "요청하신 내용을 바탕으로 초안을 생성했습니다.",
            time: "방금",
          },
        ],

        /**
         * 최초 생성 버전
         *
         * 중요:
         * - content를 반드시 넣어야 v1 미리보기/복원이 정상 동작한다.
         */
        versions: [
          {
            id: "v1",
            title: "초안 생성",
            summary: "AI가 최초 초안을 생성했습니다.",
            content: data.content,
            current: true,
          },
        ],

        prompt: "",
        showHistory: false,
      }));

      /**
       * 새 초안 생성 후 최근 작성 목록에도 즉시 반영한다.
       * DB 재조회 전에도 Sidebar/AssistantHome에 바로 보이게 하기 위함.
       */
      setRecents((prev) => [
        {
          id: String(data.sessionId),
          sessionId: data.sessionId,
          title: data.title || formData.title || "제목 없는 AI 문서",
          type: data.type || currentFormType,
          screen: "writer",
          updatedAt: new Date().toISOString(),
        },
        ...prev.filter(
          (doc) => String(doc.sessionId) !== String(data.sessionId)
        ),
      ]);

      goAssistantDoc(data.sessionId, currentFormType);
    } catch (err) {
      console.error("AI 초안 생성 실패", err);
      setDraftError(
        "AI 초안 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
      );
    } finally {
      setGeneratingDraft(false);
    }
  };

  // ------------------------------------------------
  // 6) 사이드바 / 최근 작성 클릭 처리
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
    }
  };

  /**
   * 최근 작성 클릭 처리
   *
   * DB 기반 recent 문서는 screen="writer"로 들어온다.
   * 이 경우 sessionId 기준으로 writer URL로 이동한다.
   */
  const handleRecentClick = (doc) => {
    if (doc.screen === "writer") {
      goAssistantDoc(doc.sessionId ?? doc.id, doc.type ?? "report");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      title: doc.title,
    }));

    goAssistantForm(doc.type ?? "report");
  };

  // ------------------------------------------------
  // 7) 독립 기능 화면 렌더링
  // ------------------------------------------------

  const renderStandalonePage = () => {
    if (currentTab === "chatbot") {
      return <ChatbotScreen userInfo={userInfo} />;
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
      return <KnowledgeRequestScreen userInfo={userInfo} />;
    }

    return null;
  };

  // ------------------------------------------------
  // 8) AI 비서 내부 화면 렌더링
  // ------------------------------------------------

  const renderAssistantPage = () => {
    if (currentScreen === "assistant-home") {
      return (
        <AssistantHome
          onOpenForm={goAssistantForm}
          onOpenTemplate={goAssistantTemplate}
          recents={recents}
          onRecentClick={handleRecentClick}
          loadingRecents={loadingRecents}
          recentError={recentError}
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
          onGenerateDraft={handleGenerateDraft}
          onOpenTemplate={goAssistantTemplate}
          generating={generatingDraft}
          error={draftError}
        />
      );
    }

    if (currentScreen === "template") {
      return (
        <TemplateScreen
          onOpenForm={goAssistantForm}
          onStartTemplate={(card) => {
            // 선택한 템플릿의 title / desc / preview를 기반으로 AI 초안 생성에 필요한 입력값을 미리 구성
            const previewText = Array.isArray(card.preview)
              ? card.preview.join("\n")
              : "";

            const inferredType =
              card.type === "minutes" || card.type === "approval" || card.type === "report"
                ? card.type
                : card.tag?.includes("회의") || card.title?.includes("회의")
                ? "minutes"
                : card.tag?.includes("결재") || card.title?.includes("결재")
                ? "approval"
                : "report";

            setFormData((prev) => ({
              ...prev,

              // 문서 제목
              title: card.title || "",

              // 작성 목적
              purpose:
                card.desc ||
                "선택한 템플릿을 바탕으로 업무 문서 초안을 작성하기 위함",

              // 대상 독자
              audience:
                inferredType === "approval"
                  ? "팀장 및 결재권자"
                  : inferredType === "minutes"
                  ? "회의 참석자 및 공유 대상자"
                  : "팀장 및 유관 부서 담당자",

              // 정리 대상/보고 대상
              targets:
                inferredType === "minutes"
                  ? ["참석자 공유", "액션아이템 중심"]
                  : inferredType === "approval"
                  ? ["팀장", "부서장"]
                  : ["팀장", "전사 공유"],

              // 핵심 내용
              detail:
                previewText ||
                "선택한 템플릿의 구조를 바탕으로 문서 초안을 작성해 주세요.",

              // 원하는 분량/방식
              amount:
                inferredType === "minutes"
                  ? "결정사항 및 액션아이템 중심"
                  : inferredType === "approval"
                  ? "승인자가 이해하기 쉬운 간결한 결재 사유"
                  : "A4 1페이지 내외",
            }));

            goAssistantForm(inferredType);
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

    return null;
  };

  // ------------------------------------------------
  // 9) 최종 페이지 선택
  // ------------------------------------------------

  const page = useMemo(() => {
    const standalonePage = renderStandalonePage();
    if (standalonePage) return standalonePage;

    const assistantPage = renderAssistantPage();
    if (assistantPage) return assistantPage;

    return (
      <AssistantHome
        onOpenForm={goAssistantForm}
        onOpenTemplate={goAssistantTemplate}
        recents={recents}
        onRecentClick={handleRecentClick}
        loadingRecents={loadingRecents}
        recentError={recentError}
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
    userInfo,
    generatingDraft,
    draftError,
    loadingRecents,
    recentError,
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