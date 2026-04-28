// constants/path.js
// 1) 단순 URL 주소 문자열을 상수로 정의하는 단계 (데이터)
// path.js(여기!) -> routes/대분류 별 파일 -> routes/index.js -> App.js 

export const PATH = {
  ROOT: "/",

  // 대분류 : 인증/인가   
  AUTH: {
    LOGIN: "/auth/login",
    WELCOME: "/auth/welcome",
    USERHOME: "/auth/userhome",
    MYPAGE: "/auth/mypage"
  },

  // 대분류 : 근태 관리
  ATTENDANCE: {
    ROOT: "/attendance",                // 근태 관리 페이지
    COMMUTE: "/attendance/commute",     // 출퇴근 처리 페이지
    STATS: "/attendance/stats",         // 근태 통계 페이지    
    HOLIDAYS: "/attendance/holidays",   // 연차 현황 페이지
  },

  // 대분류 : 캘린더
  CALENDAR: {
    ROOT: "/calendar",                  // 캘린더 메인 페이지
    SIMPLE_ADD: "/calendar/simple-add", // 일정 간단 등록 페이지
    DETAIL_ADD: "/calendar/detail-add", // 상세 등록 / 반복 / 참석자 일정 페이지
    DETAIL: "/calendar/detail",         // 일정 상세/삭제 페이지
  },

  // 대분류 : 전자결재
  APPROVAL: {
    ROOT: "/approval",                                      // 전자결재 메인 페이지
    NEW_SELECT: "/approval/new/select-form",                //  새 결재 진행 - 결재 서식 선택 페이지
    NEW_WRITE: "/approval/new/write",                       // 새 결재 진행 - 결재 내용 작성 페이지
    NEW_SETLINE: "/approval/new/set-line",                  // 새 결재 진행 - 결재선 설정 페이지
    TMP: "/approval/tmpApprovals",                          // 임시저장함 페이지
    PERSONAL: "/approval/personalApprovals",                // 개인 문서함 페이지
    PERSONAL_DETAIL: "/approval/personalApprovals/detail",  // 개인 문서 상세 페이지
    PENDING: "/approval/pendingApprovals",                  // 결재 대기 문서함 페이지
    PENDING_DETAIL: "/approval/pendingApprovals/detail",    // 결재 대기 문서 상세 페이지
    UPCOMING: "/approval/upcomingApprovals",                // 결재 예정 문서함 페이지
  },

  // 대분류 : 인사평가 - 온보딩
  ONBOARDING: {
    MYROADMAP: "/onboarding/myroadmap",         // 로드맵
    QUIZ: "/evaluation/quiz",                   // 퀴즈
    EVALUATION: "/evaluation/evaluation",       // 평가
  }, 
  
  // 인사평가 - 외부 AI 서버 통신용
  AI_API: {
    BASE: process.env.REACT_APP_AI_SERVER_URL || 'http://localhost:8000',
    ROADMAP: (empNo) => `/api/ai/roadmap/${empNo}`,
  },

  // 대분류 : 인사관리
  EMPLOYEE: {
    ROOT: "/employee",          // 인사관리 메인 페이지
    DETAIL: "/employee/detail", // 인사관리 상세 페이지
  },

  // 대분류 : 급여관리
  PAYROLL: {
    ROOT: "/payroll",           // 사원별 급여 확인 페이지
    ISSUE: "/payroll/issue",    // 사원별 급여명세서 발급 페이지
  },

  // 사내 AI 포털
  AI: {
    ROOT: "/ai-portal",

    // AI 비서
    ASSISTANT: "/ai-portal/assistant",                    // AI 비서 홈
    ASSISTANT_NEW: "/ai-portal/assistant/new",            // 새 문서 작성 시작
    ASSISTANT_TEMPLATE: "/ai-portal/assistant/template",  // 템플릿 생성
    ASSISTANT_DOC: "/ai-portal/assistant/docs/:docId",    // 기존 문서/이전 대화 진입

    // 추가 기능
    CORRECTION: "/ai-portal/correction",                  // 문장 다듬기
    KNOWLEDGE_REQUEST: "/ai-portal/knowledge-request",    // 지식 추가 요청

    // AI 챗봇
    CHATBOT: "/ai-portal/chatbot",                        // AI 챗봇 메인
  },

  ETC: {
    // 대분류 : 실시간 알림
    ALERT: "/alert",
  }
};