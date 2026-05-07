/* aiSecretary 전용 데이터 (docMeta) */
// src/pages/aiSecretary/constants/aiSecretaryData.js
// 화면 로직과 데이터 상수를 분리해야 유지보수와 교체가 쉬워짐.

export const docMeta = {
  report: {
    label: "보고서 초안",
    badge: "REPORT",
    description: "성과 정리, 인사이트 요약, 제안 작성에 적합합니다.",
  },
  minutes: {
    label: "회의록 정리",
    badge: "MINUTES",
    description: "회의 내용을 항목별로 구조화합니다.",
  },
  approval: {
    label: "결재 사유",
    badge: "APPROVAL",
    description: "결재 배경과 필요성, 기대효과를 정리합니다.",
  },
  mail: {
    label: "문장 다듬기",
    badge: "POLISH",
    description: "맞춤법, 톤, 길이, 표현을 더 자연스럽고 명확하게 다듬습니다.",
  },
  template: {
    label: "템플릿 생성",
    badge: "TEMPLATE",
    description: "반복 문서의 기본 뼈대를 빠르게 시작합니다.",
  },
};

// 이전 대화 목록
export const recentDocsSeed = [
  { id: "r1", title: "3분기 마케팅 성과 보고서 초안", date: "2024.05.24", screen: "writer", type: "report" },
  { id: "r2", title: "신규 프로젝트 추진 계획(안)", date: "2024.05.22", screen: "form", type: "report" },
  { id: "r3", title: "4월 주간 운영회의 회의록", date: "2024.05.21", screen: "form", type: "minutes" },
  { id: "r4", title: "외부 교육 참가 결재 요청", date: "2024.05.20", screen: "form", type: "approval" },
  { id: "r5", title: "프로젝트 주간 보고 초안", date: "2024.05.19", screen: "writer", type: "report" },
  { id: "r6", title: "상반기 마케팅 리뷰", date: "2024.05.18", screen: "writer", type: "report" },
  { id: "r7", title: "임원 보고용 요약 보고서", date: "2024.05.17", screen: "form", type: "report" },
  { id: "r8", title: "5월 킥오프 회의록", date: "2024.05.16", screen: "form", type: "minutes" },
  { id: "r9", title: "예산 집행 승인 요청", date: "2024.05.15", screen: "form", type: "approval" },
  { id: "r10", title: "교육 참석 안내문 초안", date: "2024.05.14", screen: "form", type: "report" },
  { id: "r11", title: "주간 실적 보고서", date: "2024.05.13", screen: "writer", type: "report" },
  { id: "r12", title: "협조 요청 공문 초안", date: "2024.05.12", screen: "form", type: "approval" },
];

// 추천 템플릿
export const templateCards = [
  {
    id: "tpl-report-weekly-sales",
    type: "report",
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
    type: "report",
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
    type: "minutes",
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
    type: "minutes",
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
    type: "approval",
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
    type: "approval",
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