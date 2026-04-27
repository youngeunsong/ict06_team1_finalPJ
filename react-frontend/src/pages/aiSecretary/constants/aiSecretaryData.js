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
    id: "t1",
    title: "주간 업무보고",
    tag: "영업팀",
    desc: "주간 실적과 주요 업무 진행 상황을 공유하기 위한 보고 템플릿입니다.",
    preview: ["1. 주요 실적 요약", "- 매출 실적", "- 주요 성과 및 인사이트"],
  },
  {
    id: "t3",
    title: "휴가 인수인계 문서",
    tag: "인사팀",
    desc: "휴가 전·후 업무 인수인계 사항을 체계적으로 정리하는 템플릿입니다.",
    preview: ["1. 인수인계 개요", "- 휴가 기간", "- 대체 담당자"],
  },
  {
    id: "t4",
    title: "교육 참석 안내문",
    tag: "인사팀",
    desc: "사내 교육/세미나 참여를 안내하기 위한 공지 템플릿입니다.",
    preview: ["교육 개요", "- 교육명", "- 일시/장소"],
  },
  {
    id: "t5",
    title: "프로젝트 주간 보고",
    tag: "기획팀",
    desc: "프로젝트 진행 현황, 이슈, 다음 액션을 주 단위로 정리하는 템플릿입니다.",
    preview: ["1. 이번 주 진행 내용", "2. 주요 이슈", "3. 다음 주 계획"],
  },
  {
    id: "t6",
    title: "협조 요청 공문",
    tag: "공통",
    desc: "타 부서 또는 외부 기관에 협조를 요청할 때 사용하는 공식 문서 템플릿입니다.",
    preview: ["1. 요청 배경", "2. 요청 사항", "3. 회신 기한"],
  },
];