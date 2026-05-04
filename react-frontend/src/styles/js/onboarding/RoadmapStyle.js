/**
 * @FileName : RoadmapStyle.js
 * @Description : AI 온보딩 로드맵 화면 스타일 정의
 *                - 로드맵 헤더, 체크리스트 미리보기, 진행률 UI 스타일
 *                - 로드맵 카드/그룹 및 퀴즈 이동 버튼 스타일
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성 및 로드맵 스타일 분리
 * @ 2026.05.01    김다솜        카테고리별 퀴즈 이동 버튼 스타일 추가
 */

// ==============================
// 1. 로드맵 헤더 영역
// ==============================
export const roadmapHeaderStyle = {
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

// ==============================
// 2. 체크리스트 미리보기 카드
// ==============================
export const previewCardStyle = {
    marginBottom: '20px',
    padding: '16px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    cursor: 'pointer',
};

// ==============================
// 3. 전체 진행률 영역
// ==============================
export const progressBoxStyle = {
  marginBottom: '20px',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
};

export const progressTrackStyle = {
  height: '10px',
  backgroundColor: '#e9ecef',
  borderRadius: '5px',
  overflow: 'hidden',
};

// ==============================
// 4. 퀴즈 이동 버튼 영역
// ==============================
export const quizButtonAreaStyle = {
    marginTop: '15px',
    textAlign: 'right'
};

export const quizButtonStyle = {
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 500
};