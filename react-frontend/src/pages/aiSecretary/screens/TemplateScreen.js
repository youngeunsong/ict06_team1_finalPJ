/**
 * @FileName : TemplateScreen.js
 * @Description : 템플릿 추천/선택 화면
 *                - 왼쪽: AI 템플릿 생성 조건 입력
 *                - 오른쪽: 추천 템플릿 목록 / 내 AI 템플릿 목록 전환 표시
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
 * @ 2026.05.06    송혜진        AI 템플릿 생성 기능 백 연결
 * @ 2026.05.07    송혜진        문서 유형 REPORT / MINUTES / APPROVAL 대문자 기준 정리
 */

import React, { useEffect, useMemo, useState } from "react";
import AppButton from "../components/AppButton";
import Chip from "../components/Chip";
import TextInput from "../components/TextInput";
import { docMeta, templateCards } from "../constants/aiSecretaryData";
import { I, Icon } from "../constants/aiSecretaryIcons";
import { C, styles } from "../styles/aiSecretaryTheme";

import {
  createAssistantTemplate,
  createTemplateRequest,
  getMyTemplateRequests,
  unwrapApiData,
} from "../api/aiSecretaryApi";

/**
 * TemplateScreen
 *
 * 역할:
 * 1. 정적 추천 템플릿 목록을 보여준다.
 * 2. 사용자가 입력한 조건으로 AI 생성 템플릿 mock 카드를 만든다.
 * 3. AI 생성 템플릿을 추천 목록에 추가 요청한다.
 * 4. DB에 저장된 내 요청 목록을 불러와 "내 AI 템플릿"으로 복원한다.
 *
 * 주의:
 * - 현재 /assistant/template Gemini API는 아직 붙이지 않았다.
 * - AI 템플릿 생성 버튼은 현재 프론트 mock 생성으로 동작한다.
 * - 추천 목록 추가 요청은 DB API로 저장한다.
 */
export default function TemplateScreen({ empNo, onStartTemplate, onOpenForm }) {

  // 템플릿 조건 상태
  const [filters, setFilters] = useState({
    category: "", // 문서 카테고리 검색어
    dept: "", // 부서 또는 업무 영역 검색어
    situation: "", // 상황 검색어
    tone: "공식적", // 문체 선택값 (AI 템플릿 생성 조건 또는 추후 Gemini 프롬프트 조건으로 활용)
    title: true,      // 템플릿 생성 옵션 (백엔드 options_json으로 묶어 저장)
    paragraphs: true, // 템플릿 생성 옵션 (백엔드 options_json으로 묶어 저장)
    signature: true,  // 템플릿 생성 옵션 (백엔드 options_json으로 묶어 저장)
  });

  // 오른쪽 영역 표시 모드 (recommended(기존 추천 템플릿)/ generated(내가 AI로 생성한 템플릿))
  const [viewMode, setViewMode] = useState("recommended");

  // AI 템플릿 생성 중 상태
  const [generatingTemplate, setGeneratingTemplate] = useState(false);

  // 템플릿 관련 오류 메시지
  const [templateError, setTemplateError] = useState("");

  // 추천 템플릿 추가 요청 현황 모달 열림 여부
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  /**
   * DB 기준 추천 템플릿 추가 요청 목록
   *
   * 사용처:
   * - 요청 현황 모달
   * - 중복 요청 방지
   */
  const [templateRequests, setTemplateRequests] = useState([]);

  /**
   * 오른쪽 "내 AI 템플릿" 카드 목록
   *
   * 포함 대상:
   * 1. 현재 화면에서 AI 템플릿 생성 버튼으로 만든 mock 카드
   * 2. DB에서 불러온 내가 요청한 AI 템플릿 카드
   */
  const [generatedTemplates, setGeneratedTemplates] = useState([]);

  /**
   * 추천 템플릿 페이지네이션
   */
  const PAGE_SIZE = 2;
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * 내 AI 템플릿 페이지네이션
   */
  const [generatedPage, setGeneratedPage] = useState(1);

  /**
   * templateCards 안전 배열
   *
   * aiSecretaryData.js에서 templateCards export가 없거나,
   * import 결과가 배열이 아닌 경우에도 화면이 죽지 않도록 방어한다.
   */
  const safeTemplateCards = Array.isArray(templateCards) ? templateCards : [];

  // 문서 유형을 DB/API 기준 대문자로 보정 (REPORT/ MINUTES/ APPROVAL)
  const toDbType = (type) => {
    const normalized = String(type || "").trim().toUpperCase();

    if (normalized === "MINUTES") return "MINUTES";
    if (normalized === "APPROVAL") return "APPROVAL";
    return "REPORT";
  };

  // type이 없을 시, category+situation 에서 특정 단어를 보고 타입 결정
  const inferTemplateType = (category, situation) => {
    const joined = `${category || ""} ${situation || ""}`;

    if (joined.includes("회의")) return "MINUTES";
    if (joined.includes("결재") || joined.includes("승인")) return "APPROVAL";

    return "REPORT";
  };

  //상단 탭 클릭 처리 (REPORT / MINUTES / APPROVAL/ template(현화면))
  const handleTopTabClick = (tab) => {
    if (tab === "template") return;
    onOpenForm(tab);
  };

  // 특정 필드 묶음에 keyword 포함 여부 체크
  const includesAnyText = (targets, keyword) => {
    if (!keyword?.trim()) return true;

    const joined = targets
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return joined.includes(keyword.trim().toLowerCase());
  };

  /**
   * 추천 템플릿 필터링
   *
   * 중요:
   * - category / dept / situation은 각각 다른 필드 기준으로 검색한다.
   * - tone은 검색 키워드에 넣지 않는다.
   *
   * 이유:
   * - tone 기본값이 "공식적"인데 templateCards에 "공식적"이라는 단어가 없으면
   *   처음 진입하자마자 추천 템플릿이 0개가 될 수 있다.
   */
  const filteredTemplateCards = useMemo(() => {
    return safeTemplateCards.filter((card) => {
      const categoryMatched = includesAnyText(
        [card.category, card.title, card.tag],
        filters.category
      );

      const deptMatched = includesAnyText(
        [card.dept, card.tag],
        filters.dept
      );

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
   * 추천 템플릿 필터가 바뀌면 페이지를 1로 초기화한다.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.category, filters.dept, filters.situation, filters.tone]);

  /**
   * 추천 템플릿 총 페이지 수
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
   * 내 AI 템플릿 총 페이지 수
   */
  const generatedTotalPages = Math.max(
    1,
    Math.ceil((generatedTemplates?.length || 0) / PAGE_SIZE)
  );

  /**
   * 현재 페이지에 보여줄 내 AI 템플릿 카드 목록
   */
  const pagedGeneratedTemplates = (generatedTemplates || []).slice(
    (generatedPage - 1) * PAGE_SIZE,
    generatedPage * PAGE_SIZE
  );

  /**
   * 내 AI 템플릿 목록 개수가 바뀌었을 때
   * 현재 페이지가 범위를 벗어나지 않도록 보정한다.
   */
  useEffect(() => {
    if (generatedPage > generatedTotalPages) {
      setGeneratedPage(generatedTotalPages);
    }
  }, [generatedTemplates.length, generatedPage, generatedTotalPages]);

  /**
   * DB에 저장된 추천 템플릿 추가 요청을
   * 오른쪽 "내 AI 템플릿" 카드에서 사용할 수 있는 형태로 변환한다.
   *
   * 목적:
   * - 새로고침 후에도 내가 요청한 AI 생성 템플릿을 다시 카드로 보여주기 위함
   */
  const mapRequestToGeneratedTemplate = (request) => ({
    id: `request-${request.requestId}`,
    requestId: request.requestId,

    type: toDbType(request.type),
    category: request.category || "",
    dept: request.dept || "",
    situation: request.situation || "",
    tone: request.tone || "공식적",

    title: request.title || "제목 없는 템플릿",
    tag: request.statusLabel || "요청됨",
    desc:
      request.description ||
      `${request.dept || "공통"} 영역의 ${
        request.situation || "업무 문서"
      } 템플릿입니다.`,

    preview: Array.isArray(request.preview) ? request.preview : [],
    generatedContent: request.content || "",

    status: request.status,
    statusLabel: request.statusLabel,
    reflected: request.reflected,
    adminComment: request.adminComment,
    createdAt: request.createdAt,

    templateFilters: {
      category: request.category,
      dept: request.dept,
      situation: request.situation,
      tone: request.tone,
    },
  });

  /**
   * 내 추천 템플릿 추가 요청 목록 조회
   *
   * 처리:
   * 1. GET /api/ai-secretary/template-request/my?empNo=...
   * 2. templateRequests는 모달 표시용으로 저장
   * 3. generatedTemplates는 오른쪽 "내 AI 템플릿" 카드 표시용으로 복원
   */
  const loadMyTemplateRequests = async () => {
    if (!empNo) return;

    try {
      const response = await getMyTemplateRequests(empNo);
      const data = unwrapApiData(response) ?? [];

      const requestList = Array.isArray(data) ? data : [];

      setTemplateRequests(requestList);
      setGeneratedTemplates(requestList.map(mapRequestToGeneratedTemplate));
    } catch (error) {
      console.error("추천 템플릿 요청 목록 조회 실패", error);
      setTemplateError("추천 템플릿 요청 목록을 불러오지 못했습니다.");
    }
  };

  // 화면 진입 또는 empNo 변경 시 내 요청 목록을 DB에서 조회
  useEffect(() => {
    loadMyTemplateRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empNo]);

  // AI 템플릿 생성 버튼 클릭 처리
  const handleGenerateTemplate = async () => {
    if (generatingTemplate) return;

    // 사용자 정보가 없을 시 돌아가라
    if(!empNo) {
      setTemplateError("사용자 정보를 찾을 수 없습니다. 다시 로그인해 주세요.");
      return;
    };

    // 초기화
    setGeneratingTemplate(true);
    setTemplateError("");

    try {
      const category = filters.category || "보고";
      const dept = filters.dept || "공통";
      const situation = filters.situation || "업무 문서 작성";
      const tone = filters.tone || "공식적";
      const inferredType = inferTemplateType(category, situation);

      // AI 템플릿 생성 API 호출
      const response = await createAssistantTemplate({
        empNo: String(empNo),
        type: inferredType,
        category,
        dept,
        situation,
        tone,
        includeTitle: Boolean(filters.title),
        includeParagraphs: Boolean(filters.paragraphs),
        includeSignature: Boolean(filters.signature),
      });

      // API 답변에서 실제 데이터만 추출
      const data = unwrapApiData(response);

      // 
      const generatedCard = {
        id: `generated-${Date.now()}`,
        type: toDbType(data?.type || inferredType),
        category: data?.category || category,
        dept: data?.dept || dept,
        situation: data?.situation || situation,
        tone: data?.tone || tone,
        
        title: data?.title || `${situation} 템플릿`,
        tag: data?.fallback ? "AI 대체 생성" : "AI 생성",
        desc:
          data?.description ||
          `${dept} 부서의 ${situation} 상황에 맞춰 생성된 AI 템플릿입니다.`,

        preview: Array.isArray(data?.preview) ? data.preview : [],
        generatedContent: data?.content || "",

        fallback: Boolean(data?.fallback),
        modelName: data?.modelName || "gemini",

        templateFilters: {
          ...filters,
          category,
          dept,
          situation,
          tone,
        },
      }

        setGeneratedTemplates((prev) => [generatedCard, ...prev]);
        setGeneratedPage(1);
        setViewMode("generated");
    } catch (error) {
        console.error("AI 템플릿 생성 실패", error);

        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "AI 템플릿 생성 중 문제가 발생했습니다.";

        setTemplateError(message);
    } finally {
        setGeneratingTemplate(false);
    }
  };

  // 요청 상태 라벨
  const getRequestStatusLabel = (status) => {
    switch (status) {
      case "APPROVED":
        return "승인 완료";
      case "REJECTED":
        return "반려";
      case "CANCELLED":
        return "취소됨";
      case "PENDING":
      default:
        return "검토 대기";
    }
  };

  /**
   * 요청 상태별 badge 스타일
   */
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
      case "CANCELLED":
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

  /**
   * 문자열 비교용 정규화
   */
  const normalizeText = (value) => String(value || "").trim();

  /**
   * 중복 요청 판별
   *
   * 기준:
   * - 같은 제목
   * - 같은 category
   * - 같은 dept
   * - 같은 situation
   * - 상태가 PENDING 또는 APPROVED
   */
  const isSameTemplateRequest = (request, card) => {
    const sameTitle = normalizeText(request.title) === normalizeText(card.title);

    const sameCategory =
      normalizeText(request.category) === normalizeText(card.category);

    const sameDept = normalizeText(request.dept) === normalizeText(card.dept);

    const sameSituation =
      normalizeText(request.situation) === normalizeText(card.situation);

    const activeStatus =
      request.status === "PENDING" || request.status === "APPROVED";

    return sameTitle && sameCategory && sameDept && sameSituation && activeStatus;
  };

  /**
   * 추천 템플릿 목록에 추가 요청
   *
   * 처리 흐름:
   * 1. 프론트에서 1차 중복 요청 방지
   * 2. POST /api/ai-secretary/template-request
   * 3. 저장 성공 후 DB 목록 재조회
   * 4. 요청 현황 모달 오픈
   */
  const handleRequestAddTemplate = async (card) => {
    if (!card) return;

    if (!empNo) {
      setTemplateError("사용자 정보를 찾을 수 없습니다. 다시 로그인해 주세요.");
      return;
    }

    const alreadyRequested = templateRequests.some((request) =>
      isSameTemplateRequest(request, card)
    );

    if (alreadyRequested) {
      setTemplateError(
        "이미 검토 대기 중이거나 승인된 추천 템플릿 추가 요청이 있습니다."
      );
      setRequestModalOpen(true);
      return;
    }

    try {
      const payload = {
        empNo: String(empNo),

        type: toDbType(card.type),
        category: card.category || "",
        dept: card.dept || "",
        situation: card.situation || "",
        tone: card.tone || filters.tone || "공식적",

        title: card.title || "제목 없는 템플릿",
        description: card.desc || card.description || "",
        content:
          card.generatedContent ||
          (Array.isArray(card.preview) ? card.preview.join("\n") : ""),

        preview: Array.isArray(card.preview) ? card.preview : [],

        /**
         * 백엔드 Service에서 options_json으로 묶어 저장한다.
         */
        includeTitle: Boolean(filters.title),
        includeParagraphs: Boolean(filters.paragraphs),
        includeSignature: Boolean(filters.signature),
      };

      await createTemplateRequest(payload);

      /**
       * 저장 성공 후 DB 기준으로 다시 조회한다.
       * 이때 generatedTemplates도 DB 요청 목록 기준으로 복원된다.
       */
      await loadMyTemplateRequests();

      setRequestModalOpen(true);
    } catch (error) {
      console.error("추천 템플릿 추가 요청 저장 실패", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "추천 템플릿 추가 요청 저장 중 문제가 발생했습니다.";

      setTemplateError(message);
      setRequestModalOpen(true);
    }
  };

  /**
   * 템플릿 시작 처리
   *
   * TemplateScreen은 직접 AI 초안 생성 API를 호출하지 않는다.
   * 선택한 템플릿 card를 상위 AiSecretary.js로 넘긴다.
   */
  const handleStartTemplate = (card) => {
    if (!card) return;

    onStartTemplate({
      ...card,

      /**
       * 현재 선택한 필터 조건도 함께 전달한다.
       * 정적 추천 템플릿 / AI 생성 템플릿 모두 같은 함수로 처리하기 위함이다.
       */
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
        {["REPORT", "MINUTES", "APPROVAL", "template"].map((tab) => {
          const active = tab === "template";

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
          <h3 style={styles.sectionTitle}>
            {viewMode === "generated"
              ? "AI 생성 템플릿 조건"
              : "추천 템플릿 검색"}
          </h3>

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
              내 AI 템플릿
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
        </div>

        {/* 우측: 추천 템플릿 / 내 AI 템플릿 영역 */}
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
              {/* 우측 타이틀 */}
              <h3 style={styles.sectionTitle}>
                {viewMode === "generated" ? "내 AI 템플릿" : "추천 템플릿"}
              </h3>

              {/* 우측 건 수 */}
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

              {/* 내 AI 템플릿 보기에서만 요청 현황 버튼 노출 */}
              {viewMode === "generated" && (
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(true)}
                  style={{
                    height: 30,
                    padding: "0 12px",
                    borderRadius: 999,
                    border: `1px solid ${C.border}`,
                    background: "#fff",
                    color: C.accent,
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  요청 현황 보기
                </button>
              )}
            </div>

            {/* 우측 페이지 표시 */}
            <div style={{ fontSize: 14, color: C.sub, fontWeight: 700 }}>
              {viewMode === "generated"
                ? `${generatedPage} / ${generatedTotalPages} 페이지`
                : `${currentPage} / ${totalPages} 페이지`}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                viewMode === "generated"
                  ? (pagedGeneratedTemplates?.length || 0) === 0
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

                {generatedTemplates.length > 0 &&
                  pagedGeneratedTemplates.map((card) => (
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
                          {card.statusLabel || "AI 생성"}
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

          {/* 추천 템플릿 / 내 AI 템플릿 페이지네이션 */}
          {(viewMode === "recommended"
            ? filteredTemplateCards.length > PAGE_SIZE
            : generatedTemplates.length > PAGE_SIZE) && (
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
                onClick={() => {
                  if (viewMode === "generated") {
                    setGeneratedPage((prev) => Math.max(prev - 1, 1));
                  } else {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                  }
                }}
                disabled={
                  viewMode === "generated"
                    ? generatedPage === 1
                    : currentPage === 1
                }
              >
                이전
              </AppButton>

              {Array.from(
                {
                  length:
                    viewMode === "generated"
                      ? generatedTotalPages
                      : totalPages,
                },
                (_, idx) => idx + 1
              ).map((page) => {
                const active =
                  viewMode === "generated"
                    ? generatedPage === page
                    : currentPage === page;

                return (
                  <AppButton
                    key={page}
                    variant={active ? "primary" : "secondary"}
                    style={{
                      height: 36,
                      minWidth: 36,
                      padding: "0 12px",
                    }}
                    onClick={() => {
                      if (viewMode === "generated") {
                        setGeneratedPage(page);
                      } else {
                        setCurrentPage(page);
                      }
                    }}
                  >
                    {page}
                  </AppButton>
                );
              })}

              <AppButton
                variant="secondary"
                style={{ height: 36 }}
                onClick={() => {
                  if (viewMode === "generated") {
                    setGeneratedPage((prev) =>
                      Math.min(prev + 1, generatedTotalPages)
                    );
                  } else {
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, totalPages)
                    );
                  }
                }}
                disabled={
                  viewMode === "generated"
                    ? generatedPage === generatedTotalPages
                    : currentPage === totalPages
                }
              >
                다음
              </AppButton>
            </div>
          )}
        </div>
      </div>

      {/* 추천 템플릿 추가 요청 현황 모달 */}
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
                  const requestDate = request.createdAt || request.requestedAt;

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
                            {request.category} · {request.dept} ·{" "}
                            {request.situation}
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
                          {request.statusLabel ||
                            getRequestStatusLabel(request.status)}
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
                          {requestDate
                            ? new Date(requestDate).toLocaleString("ko-KR")
                            : "-"}
                        </div>

                        <div>
                          반영 여부:{" "}
                          {request.reflected
                            ? "추천 목록에 추가됨"
                            : "미반영"}
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