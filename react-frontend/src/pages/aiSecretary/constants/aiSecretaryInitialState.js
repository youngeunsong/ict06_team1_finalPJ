/* AiSecretary.js 전용 초기 데이터 묶음 */
// src/pages/constants/aiSecretaryInitialState.js

export const initialFormData = {
  title: "",
  purpose: "",
  audience: "",
  targets: ["팀장"],
  detail: "",
  amount: "",
};

export const initialCorrectionState = {
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
    {
      id: "v1",
      title: "최초 생성",
      summary: "요청 내용을 바탕으로 초안을 처음 생성했습니다.",
      current: false,
    },
    {
      id: "v2",
      title: "결론 보강",
      summary: "결론 부분에 성과 요약과 향후 방향을 보강했습니다.",
      current: false,
    },
    {
      id: "v3",
      title: "팀장 보고용 톤 반영",
      summary: "결론을 간결하게 정리하고 보고용 톤으로 다듬었습니다.",
      current: true,
    },
  ],
};