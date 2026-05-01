/**
 * @FileName : RoadmapStyle.js
 * @Description : AI 온보딩 로드맵 화면 스타일 정의
 *                - 로드맵 헤더 스타일
 *                - 진행률 박스 및 진행률 바 스타일
 *                - 로드맵 카드/그룹 UI 스타일
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성 및 로드맵 스타일 분리
 */

export const roadmapHeaderStyle = {
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

export const previewCardStyle = {
    marginBottom: '20px',
    padding: '16px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    cursor: 'pointer',
};

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