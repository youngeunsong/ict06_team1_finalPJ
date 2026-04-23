import React, { useEffect, useRef, useState } from 'react';

// ────────────────────────────────────────────────────────────────────────
// 1. 스타일 및 설정 데이터 (추후 css 파일로 뺄 예정)
// ────────────────────────────────────────────────────────────────────────
const styles = {
  // 전체 컨테이너: 사이드바와 채팅창을 가로로 배치
  container: {
    display: "flex",
    height: "calc(100vh - 120px)", // 화면 높이에서 헤더 등을 제외한 높이
    background: "#F0F2F8",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    fontFamily: "'Pretendard', sans-serif",
  },
  // 사이드바: 짙은 네이비 배경의 메뉴 영역
  sidebar: {
    width: "220px",
    background: "#1A2B6E",
    color: "white",
    display: "flex",
    flexDirection: "column",
    padding: "24px 12px",
  },
  sidebarItem: (isActive) => ({
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "4px",
    background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
    color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.6)",
    transition: "0.2s",
  }),
  // 메인 영역: 흰색 배경의 채팅 공간
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#FFFFFF",
  },
  header: {
    padding: "18px 24px",
    borderBottom: "1px solid #F0F0F0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
  },
  // 채팅 메시지 리스트 영역
  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  // 메시지 말풍선 공통 스타일
  bubble: (isUser) => ({
    maxWidth: "75%",
    padding: "12px 18px",
    borderRadius: isUser ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
    fontSize: "14px",
    lineHeight: "1.6",
    background: isUser ? "#3B5BDB" : "#F1F4FF",
    color: isUser ? "#FFFFFF" : "#1F2937",
    boxShadow: isUser ? "0 4px 10px rgba(59, 91, 219, 0.2)" : "none",
  }),
  // 출처(Source) 태그 스타일
  sourceTag: {
    display: "inline-block",
    padding: "3px 10px",
    background: "#E8EDFF",
    color: "#3B5BDB",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    marginTop: "8px",
    marginRight: "6px",
  },
  // 하단 입력창 영역
  inputContainer: {
    padding: "20px 24px",
    borderTop: "1px solid #F0F0F0",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#F3F4F6",
    padding: "6px 10px",
    borderRadius: "12px",
  },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "10px",
    fontSize: "14px",
    outline: "none",
  },
  sendBtn: {
    background: "#3B5BDB",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  }
};

// ────────────────────────────────────────────────────────────────────────
// 2. 비즈니스 로직 및 데이터
// ────────────────────────────────────────────────────────────────────────
const QA_DATA = {
    '휴가는 어떻게 신청하나요?': {
        text: '사내 그룹웨어 [인사/근태] 탭에서 신청 가능합니다. 최소 3일 전 승인을 권장합니다.'
        src: ['인사관리규정', '근태가이드']
    },
    '복지 포인트 사용처를 알려줘' : {
        text: '지정된 복지몰 및 오프라인 제휴처에서 사용 가능합니다. 매년 1월에 포인트가 지급됩니다.'
        src: ['복지제도 안내']
    }
};

// ────────────────────────────────────────────────────────────────────────
// 3. 메인 컴포넌트
// ────────────────────────────────────────────────────────────────────────
export default function AiSecretary() {
  const [messages, setMessages] = useState([
      {role: "ai", text: "안녕하세요, 사내 지원 AI 비서입니다. 무엇을 도와드릴까요?"}
  ]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef(null);

  // 새 메시지가 올 때마다 바닥으로 스크롤 이동
  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages]);

  const onSend = (text) => {
      const targetText = text || inputValue;
      
      //입력 값이 진짜 있는지 체크
      if (!targetText.trim()) return;

      // 1. 유저 메시지 화면에 추가
      setMessages(prev => [...prev, { role: "user", text: targetText }]);
      setInputValue("");

      // 2. AI 답변 로직 (지연 시간을 주어 실제 대화 느낌을 줌)
      setTimeout(() => {
          const found = QA_DATA[targetText] || {
              text: '문의하신 내용의 답변을 찾는 중입니다. 급하신 용무는 담당 부서로 연락 바랍니다.',
              src: ['인트라넷 검색 결과']
          };
          setMessages(prev => [...prev, { role: "ai", ...found }]);
      }, 600);
  };


const AiSecretary = () => {
    return (
        <div style={style.sidebar}>
            <div style={{fontSize: "18px", fontWeight: "800", marginBottom: "30px", padding: "0 16px"}}>AI Portal</div>
            <div style={styles.sidebarItem(true)}>채팅 상담</div>
            <div style={styles.sidebarItem(false)}>문서 분석</div>
            <div style={styles.sidebarItem(false)}>설정</div>
        </div>

        {/* 오른쪽 메인 채팅창 */}
        <div style={styles.main}>
          <div style={styles.header}>AI 어시스턴트</div>

          {/* 대화 내용 영역 */}
          <div style={styles.main}>
            <div style={chatArea} ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start"}}>
                  <div style={{ maxWidth: "80%" }}>
                    <div style={styles.bubble(m.role === "user")}>
                      {m.text}
                    </div>
                    {/* 답변 근거(Source)가 있는 경우만 표시 (조건부 렌더링) */}
                    {m.src && (
                      <div style={{ marginTop: "4px" }}>
                        {m.src.map((s, si) => (
                          <span key={si} style={styles.sourceTag}>#{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* 초기 진입 시 추천 질문 (버튼 클릭) */}

            </div>


          </div>

        </div>
    );
};
