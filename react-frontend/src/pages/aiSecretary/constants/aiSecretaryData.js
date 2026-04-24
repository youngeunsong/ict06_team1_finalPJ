/* aiSecretary 전용 데이터 (docMeta) */

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
    label: "메일 문구 교정",
    badge: "MAIL",
    description: "업무 메일을 더 자연스럽고 명확하게 다듬습니다.",
  },
  template: {
    label: "템플릿 추천",
    badge: "TEMPLATE",
    description: "조건에 맞는 관리자 제공 템플릿으로 문서를 빠르게 시작합니다.",
  },
};

export const recentDocsSeed = [
  { id: "r1", title: "3분기 마케팅 성과 보고서 초안", date: "2024.05.24", screen: "writer" },
  { id: "r2", title: "신규 프로젝트 추진 계획(안)", date: "2024.05.22", screen: "form", type: "report" },
];

export const templateCards = [
  {
    id: "t1",
    targetType: "report",
    title: "주간 업무보고",
    tag: "영업팀",
    desc: "관리자가 등록한 주간 실적 및 진행 현황 보고용 템플릿입니다.",
    preview: ["1. 주요 실적 요약", "- 매출 실적", "- 주요 성과 및 인사이트"],
  },
  {
    id: "t2",
    targetType: "mail",
    title: "회의 요청 메일",
    tag: "공통",
    desc: "관리자가 등록한 회의 일정 조율 및 참석 요청용 메일 템플릿입니다.",
    preview: ["안녕하세요.", "아래와 같이 회의를 진행하고자 하오니", "참석 가능 여부를 회신 부탁드립니다."],
  },
  {
    id: "t3",
    targetType: "report",
    title: "휴가 인수인계 문서",
    tag: "인사팀",
    desc: "관리자가 등록한 휴가 전·후 업무 인수인계 정리용 템플릿입니다.",
    preview: ["1. 인수인계 개요", "- 휴가 기간", "- 대체 담당자"],
  },
  {
    id: "t4",
    targetType: "report",
    title: "교육 참석 안내문",
    tag: "인사팀",
    desc: "관리자가 등록한 사내 교육/세미나 안내용 템플릿입니다.",
    preview: ["교육 개요", "- 교육명", "- 일시/장소"],
  },
];

export const initialFormData = {
  title: "",
  purpose: "",
  audience: "",
  targets: ["팀장"],
  detail: "",
  amount: "",
};

export const initialCorrection = {
  tone: "공손",
  strength: "보통",
  length: "유지",
  spellCheck: true,
};

export const initialWriterState = {
  prompt: "",
  showHistory: true,
  chat: [
    {
      role: "ai",
      text: "요청 내용을 바탕으로 문서를 생성했습니다. 초안을 확인하고 필요한 부분을 알려주세요.",
      time: "10:12 AM",
    },
    {
      role: "user",
      text: "결론을 더 짧게 정리해줘.",
      time: "10:16 AM",
    },
    {
      role: "ai",
      text: "요청하신 내용에 맞게 결론을 간결하게 수정하여 초안을 업데이트했습니다.",
      time: "10:17 AM",
    },
  ],
  versions: [
    { id: "v1", title: "최초 생성", summary: "요청 내용을 바탕으로 초안을 처음 생성했습니다.", current: false },
    { id: "v2", title: "결론 보강", summary: "결론 부분에 성과 요약과 향후 방향을 보강했습니다.", current: false },
    { id: "v3", title: "팀장 보고용 톤 반영", summary: "결론을 간결하게 정리하고 보고용 톤으로 다듬었습니다.", current: true },
  ],
};