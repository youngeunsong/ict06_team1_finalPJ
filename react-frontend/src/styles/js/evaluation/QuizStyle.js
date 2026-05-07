/**
 * @FileName : QuizStyle.js
 * @Description : AI 평가 퀴즈 화면 스타일 정의
 *                - 퀴즈 화면 레이아웃, 문항 카드, 보기 영역 스타일
 *                - 제출 버튼, 결과 요약, 해설 영역 스타일
 * @Author : 김다솜
 * @Date : 2026. 04. 30
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.30    김다솜        최초 생성 및 퀴즈 화면 스타일 분리
 * @ 2026.05.01    김다솜        카테고리별 일괄 제출 UI 및 결과 요약 스타일 추가
 */

// ==============================
// 1. 화면 기본 레이아웃
// ==============================
export const quizContainer = {
    padding: '20px'
};

export const quizHeader = {
    marginBottom: '20px'
};

export const categoryText = {
    fontSize: '14px',
    color: '#6c757d',
    marginTop: '6px'
};

// ==============================
// 2. 퀴즈 문항 카드 / 보기 영역
// ==============================
export const questionCard = {
    padding: '16px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #edf0f2',
    minHeight: '180px'
};

export const questionGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '14px'
};

export const questionTitle = {
    fontSize: '16px',
    fontWeight: 600,
    color: '#212529',
    marginBottom: '12px'
};

export const optionLabel = {
    display: 'block',
    marginTop: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#495057'
};

export const optionInput = {
    marginRight: '8px'
};

// ==============================
// 3. 제출 버튼 / 선택 현황
// ==============================
export const submitArea = {
    marginTop: '20px',
    textAlign: 'right'
};

export const submitButton = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#321fdb',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer'
};

export const disabledButton = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#adb5bd',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'not-allowed'
};

export const answerCountText = {
    marginTop: '8px',
    fontSize: '13px',
    color: '#868e96'
};

// ==============================
// 4. 문항별 채점 결과 / 해설
// ==============================
export const resultBox = {
    marginTop: '12px',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '10px'
};

export const resultText = {
    marginTop: '8px',
    fontSize: '13px',
    color: '#6c757d'
};

export const explanationText = {
    marginTop: '6px',
    fontSize: '13px',
    color: '#495057'
};

// ==============================
// 5. 전체 평가 결과 요약
// ==============================
export const summaryBox = {
    marginTop: '20px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '12px',
    border: '1px solid #edf0f2'
};

export const summaryTitle = {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#212529'
};

export const passText = {
    marginTop: '6px',
    fontWeight: 600,
    color: '#198754'
};

export const failText = {
    marginTop: '6px',
    fontWeight: 600,
    color: '#dc3545'
};

// ==============================
// 6. 평가 현황 카드 목록
// ==============================
export const statusGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '12px',
    marginTop: '20px'
};

export const statusCard = {
    padding: '14px',
    background: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #edf0f2',
    minHeight: '92px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
};

export const statusTitle = {
    fontWeight: 600,
    fontSize: '14px',
    color: '#212529'
};

export const statusSubText = {
    fontSize: '12px',
    color: '#868e96',
    marginTop: '4px'
};

export const statusButton = {
    padding: '4px 10px',
    fontSize: '12px',
    borderRadius: '20px',
    border: '1px solid #adb5bd',
    background: '#f8f9fa',
    color: '#6c757d',
    whiteSpace: 'nowrap'
};