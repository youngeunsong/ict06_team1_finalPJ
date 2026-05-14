/* aiSecretary 전용 데이터 상수 */
// src/pages/aiSecretary/constants/aiSecretaryData.js

/*
  역할
  --------------------------------------------------
  1. AI 비서 화면에서 사용하는 문서 유형 메타 정보 관리
  2. 최근 작성 fallback 데이터 관리
  3. 추천 템플릿 정적 seed 데이터 관리

  문서 유형 기준
  --------------------------------------------------
  백엔드 / DB / 프론트 문서 유형값은 대문자로 통일한다.

  - REPORT   : 보고서 초안
  - MINUTES  : 회의록 정리
  - APPROVAL : 결재 사유

  독립 기능 기준
  --------------------------------------------------
  - correction : 문장 다듬기 기능
  - template   : 템플릿 생성 화면

  주의
  --------------------------------------------------
  correction, template은 문서 유형이 아니다.
  따라서 VALID_FORM_TYPES에는 포함하지 않는다.
*/

/**
 * 문서/기능 메타 정보
 *
 * 사용처:
 * - AssistantHome 기능 카드
 * - StartFormScreen 상단 탭
 * - TemplateScreen 상단 탭
 * - WriterScreen 문서 유형 라벨
 */
export const docMeta = {
  REPORT: {
    label: "보고서 초안",
    badge: "REPORT",
    description: "성과 정리, 인사이트 요약, 제안 작성에 적합합니다.",
  },

  MINUTES: {
    label: "회의록 정리",
    badge: "MINUTES",
    description: "회의 내용을 항목별로 구조화합니다.",
  },

  APPROVAL: {
    label: "결재 사유",
    badge: "APPROVAL",
    description: "결재 배경과 필요성, 기대효과를 정리합니다.",
  },

  /*
    correction은 문서 유형이 아니라 독립 기능이다.

    연결 흐름:
    - PATH.AI.CORRECTION
    - CorrectionScreen
    - POST /api/ai-secretary/correction
  */
  correction: {
    label: "문장 다듬기",
    badge: "CORRECTION",
    description:
      "맞춤법, 톤, 길이, 표현을 더 자연스럽고 명확하게 다듬습니다.",
  },

  /*
    template은 문서 유형이 아니라 템플릿 생성 화면 탭이다.

    연결 흐름:
    - PATH.AI.ASSISTANT_TEMPLATE
    - TemplateScreen
    - 추천 템플릿 선택 또는 AI 생성 템플릿 생성
  */
  template: {
    label: "템플릿 생성",
    badge: "TEMPLATE",
    description: "반복 문서의 기본 뼈대를 빠르게 시작합니다.",
  },
};

/**
 * 최근 작성 fallback 데이터
 *
 * 현재 실제 최근 작성 목록은 DB의 ASSISTANT 세션 목록을 기준으로 조회한다.
 * 이 데이터는 개발/비상 fallback 또는 화면 목업 확인용으로만 유지한다.
 *
 * 주의:
 * - type은 REPORT / MINUTES / APPROVAL 대문자 기준으로 통일한다.
 * - 실제 DB 연동 후에는 recents state가 서버 응답으로 대체된다.
 */
export const recentDocsSeed = [
  {
    id: "r1",
    title: "3분기 마케팅 성과 보고서 초안",
    date: "2024.05.24",
    screen: "writer",
    type: "REPORT",
  },
  {
    id: "r2",
    title: "신규 프로젝트 추진 계획(안)",
    date: "2024.05.22",
    screen: "form",
    type: "REPORT",
  },
  {
    id: "r3",
    title: "4월 주간 운영회의 회의록",
    date: "2024.05.21",
    screen: "form",
    type: "MINUTES",
  },
  {
    id: "r4",
    title: "외부 교육 참가 결재 요청",
    date: "2024.05.20",
    screen: "form",
    type: "APPROVAL",
  },
  {
    id: "r5",
    title: "프로젝트 주간 보고 초안",
    date: "2024.05.19",
    screen: "writer",
    type: "REPORT",
  },
  {
    id: "r6",
    title: "상반기 마케팅 리뷰",
    date: "2024.05.18",
    screen: "writer",
    type: "REPORT",
  },
  {
    id: "r7",
    title: "임원 보고용 요약 보고서",
    date: "2024.05.17",
    screen: "form",
    type: "REPORT",
  },
  {
    id: "r8",
    title: "5월 킥오프 회의록",
    date: "2024.05.16",
    screen: "form",
    type: "MINUTES",
  },
  {
    id: "r9",
    title: "예산 집행 승인 요청",
    date: "2024.05.15",
    screen: "form",
    type: "APPROVAL",
  },
  {
    id: "r10",
    title: "교육 참석 안내문 초안",
    date: "2024.05.14",
    screen: "form",
    type: "REPORT",
  },
  {
    id: "r11",
    title: "주간 실적 보고서",
    date: "2024.05.13",
    screen: "writer",
    type: "REPORT",
  },
  {
    id: "r12",
    title: "협조 요청 공문 초안",
    date: "2024.05.12",
    screen: "form",
    type: "APPROVAL",
  },
];

/**
 * 추천 템플릿 정적 seed 데이터
 *
 * 현재 상태:
 * - TemplateScreen에서 추천 템플릿 목록으로 사용
 *
 * 추후 개선:
 * - AI_TEMPLATE 테이블 생성 후 DB 기반 추천 템플릿 목록으로 교체 예정
 * - 이 배열은 초기 seed 또는 fallback 데이터로만 유지 가능
 *
 * type 기준:
 * - REPORT
 * - MINUTES
 * - APPROVAL
 */
export const templateCards = [
  {
    id: "tpl-report-weekly-sales",
    type: "REPORT",
    category: "보고",
    dept: "영업",
    situation: "주간 업무 공유",
    title: "주간 업무 보고",
    tag: "영업팀",
    desc: "주간 실적과 주요 업무 진행 상황을 공유하기 위한 보고 템플릿입니다.",
    preview: [
      "1. 주요 실적 요약",
      "- 매출 실적",
      "- 주요 이슈 및 인사이트",
      "2. 다음 주 계획",
    ],
  },

  {
    id: "tpl-report-project-status",
    type: "REPORT",
    category: "보고",
    dept: "개발",
    situation: "프로젝트 진행상황 공유",
    title: "프로젝트 진행상황 보고",
    tag: "개발팀",
    desc: "프로젝트의 현재 진행 상황과 이슈, 향후 계획을 정리하는 보고 템플릿입니다.",
    preview: [
      "1. 프로젝트 개요",
      "2. 현재 진행 상황",
      "3. 주요 이슈",
      "4. 향후 계획",
    ],
  },

  {
    id: "tpl-minutes-weekly-meeting",
    type: "MINUTES",
    category: "회의록",
    dept: "기획",
    situation: "주간 회의 정리",
    title: "주간 운영회의 회의록",
    tag: "회의록",
    desc: "회의 안건, 결정사항, 액션아이템을 정리하기 위한 회의록 템플릿입니다.",
    preview: [
      "1. 회의 개요",
      "- 일시",
      "- 참석자",
      "2. 주요 안건",
      "3. 결정사항",
      "4. 액션아이템",
    ],
  },

  {
    id: "tpl-minutes-project-kickoff",
    type: "MINUTES",
    category: "회의록",
    dept: "개발",
    situation: "프로젝트 킥오프",
    title: "프로젝트 킥오프 회의록",
    tag: "회의록",
    desc: "프로젝트 시작 회의의 목표, 역할, 일정, 주요 논의 내용을 정리하는 템플릿입니다.",
    preview: [
      "1. 회의 목적",
      "2. 참석자 및 역할",
      "3. 주요 논의 내용",
      "4. 후속 작업",
    ],
  },

  {
    id: "tpl-approval-education",
    type: "APPROVAL",
    category: "결재",
    dept: "인사",
    situation: "교육 참가 요청",
    title: "외부 교육 참가 결재 요청",
    tag: "결재",
    desc: "외부 교육 참가 필요성과 기대 효과를 정리하는 결재 사유 템플릿입니다.",
    preview: [
      "1. 결재 개요",
      "2. 교육 정보",
      "3. 요청 사유",
      "4. 기대 효과",
    ],
  },

  {
    id: "tpl-approval-purchase",
    type: "APPROVAL",
    category: "결재",
    dept: "총무",
    situation: "비품 구매 요청",
    title: "비품 구매 결재 요청",
    tag: "결재",
    desc: "업무 수행에 필요한 비품 구매 사유와 비용 근거를 정리하는 템플릿입니다.",
    preview: [
      "1. 구매 요청 개요",
      "2. 구매 품목",
      "3. 필요 사유",
      "4. 예상 비용",
    ],
  },
];