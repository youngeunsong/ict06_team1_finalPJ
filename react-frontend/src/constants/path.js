// constants/path.js
export const PATH = {
  ROOT: "/",

  // 학습용 예제
  TEST: {
    LIST: "/test/list"
  },

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
    ROOT: "/onboarding",
    ROADMAP: "/onboarding/myroadmap",         // 로드맵
    LEARNING: (contentId) => `/onboarding/learning/${contentId}`,
    LEARNING_DETAIL: "/onboarding/learning/:contentId",           // 학습 상세 페이지
    QUIZ: "/onboarding/quiz",
    EVALUATION: "/evaluation/evaluation",       // 평가
    PROGRESS_COMPLETE: "/onboarding/progress/complete",
    CHECKLIST: "/onboarding/checklist",
  }, 
  
  // 인사평가 - 외부 AI 서버 통신용
  AI_API: {
    BASE: process.env.REACT_APP_AI_SERVER_URL || 'http://localhost:8000/api',
    ROADMAP: (empNo) => `/ai/roadmap/${empNo}`,
    CONTENT_DETAIL: (contentId) => `/content/${contentId}`,     // 학습자료 상세 조회
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
    PORTAL: "/ai-portal",                                       // 사내 AI 포털 메인

    // 대분류 : AI비서
    SECRETARY: "/ai-portal/secretary",                          // AI 비서 메인
    SECRETARY_QUICK: "/ai-portal/secretary/quick-start",        // AI 비서 빠른 시작 응답
    SECRETARY_CHAT: "/ai-portal/secretary/answer-to-chat",      // AI 비서 채팅에 응답

    // 대분류 : AI챗봇
    CHATBOT: "/ai-portal/chatbot",                              // AI 챗봇 열기
    CHATBOT_MAIN: "/ai-portal/chatbot/main",                    // 화면 하단에서 AI 챗봇 버튼 클릭 후 메인 페이지
    CHATBOT_MAIN_MENU: "/ai-portal/chatbot/main/select-menu",                    // 챗봇 메인 - 메뉴 선택 페이지
    CHATBOT_MAIN_MESSAGE: "/ai-portal/chatbot/main/message",                    // 챗봇 메인 - 메시지 작성 페이지
    
    CHATBOT_MENU: "/ai-portal/chatbot/select-menu",             // AI 챗봇에서 메뉴 선택
    CHATBOT_RESULT: "/ai-portal/chatbot/select-menu/result",    // AI 챗봇에서 메뉴 선택 결과
    CHATBOT_MESSAGE: "/ai-portal/chatbot/message",              // AI 챗봇에서 메시지 작성 페이지
  },

  ETC: {
    // 대분류 : 실시간 알림
    ALERT: "/alert",
  },

  // REST API
  API: {
    BASE: process.env.REACT_APP_SERVER_URL || 'http://localhost:8081/api',
    USER_ME: '/user/me',

    CHECKLIST_COMPLETE: "/onboarding/checklist/complete",
    CHECKLIST_UNCOMPLETE: "/onboarding/checklist/uncomplete",
    CHECKLIST_LIST: (empNo) => `/onboarding/checklist/${empNo}`,
  }
};