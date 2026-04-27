/* aiSecretary 전체 페이지 조립기 + 흐름 제어 역활 */
// src/pages/aiSecretary/AiSecretary.js

/* “현재 상태를 보고 어떤 화면 컴포넌트를 렌더링할지 정한다” */
/* [역활]
  - 현재 URL 읽기
  - 어떤 화면인지 판단
  - 필요한 state 들고 있기
  - 적절한 screen에 props 넘기기 */

// 1) 탭 전환, 화면 전환, 문서 유형, 입력 데이터, 교정 옵션, 작성 상태 등을 관리
// 2) 현재 상태에 맞는 하위 화면을 렌더링하는 최상위 컨트롤 컴포넌트
// 내부 화면 전환을 state 기반이 아니라 URL 기반으로 동기화

import React, { useMemo, useState } from "react";

//URL(path/query/param)을 기준으로 분기
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { PATH } from "../../constants/path";

// 규칙, 계산
import {
  normalizeFormType,
  buildAssistantDocPath,
  ASSISTANT_DOC_PREFIX,
} from "./utils/aiSecretaryRouteHelpers";

// 초기 데이터 묵음
import {
  initialFormData,
  initialCorrectionState,
  initialWriterState,
} from "./constants/aiSecretaryInitialState";

// screens 임포트
import AssistantHome from "./screens/AssistantHome";                    // AI 비서 진입 화면
import StartFormScreen from "./screens/StartFormScreen";                // AI 비서 > 문서 작성(보고서 초안 / 회의록 정리 / 결재 사유 유형) 시작 화면
import TemplateScreen from "./screens/TemplateScreen";                  // AI 비서 > 템플릿 생성 화면
import WriterScreen from "./screens/WriterScreen";                      // AI 비서 > 실질적인 AI 초안 작성/ 수정 작업 화면

import ChatbotScreen from "./screens/ChatbotScreen";                    // 챗봇 진입 화면

import CorrectionScreen from "./screens/CorrectionScreen";              // 문서 수정 화면
import KnowledgeRequestScreen from "./screens/KnowledgeRequestScreen";  // 문서 삽입 화면(사용자)

// components 임포트
import Sidebar from "./components/Sidebar";                             // 사이드바

// constants 임포트
import { recentDocsSeed } from "./constants/aiSecretaryData";

// styles 임포트
import { styles } from "./styles/aiSecretaryTheme";


// 흐름제어 컴포넌트 (화면X) ---------------------------------------------
export default function AiSecretary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { docId } = useParams();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState(initialFormData);
  const [correction, setCorrection] = useState(initialCorrectionState);
  const [writerState, setWriterState] = useState(initialWriterState);

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
  // 독립 기능 분기 : 챗봇/ 문장 다듬기 화면/ 지식 추가 화면
  const renderStandalonePage = () => {
    if(currentTab === "chatbot") {
      return <ChatbotScreen />
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
      return <KnowledgeRequestScreen />
    }

    return null;
  }

  // AI 비서 내부 분기
  const renderAssistantPage = () => {
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

    return null;
  }

  // 독립 기능 조립 vs AI 비서 내부 조립 둘 중 하나 선택 하여 fallback
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
