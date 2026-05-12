/**
 * @FileName : QuizStyle.js
 * @Description : AI 평가 퀴즈 화면 스타일 정의
*                - 퀴즈 레이아웃, 문항 카드, 응답 필드 스타일
*                - SBERT 유사도 기반 동적 배지 및 AI 피드백 전용 박스 스타일
*                - 평가 현황 및 결과 요약 컴포넌트 공통 스타일
 * @Author : 김다솜
 * @Date : 2026. 04. 30
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.30    김다솜        최초 생성 및 퀴즈 화면 스타일 분리
 * @ 2026.05.01    김다솜        카테고리별 일괄 제출 UI 및 결과 요약 스타일 추가
 * @ 2026.05.06    김다솜        AI 분석 리포트 전용 스타일(aiResultContainer, similarityBadge 등) 추가
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

export const evalResultStyles = {
    container: {
        padding: '24px',
        maxWidth: '900px',
        margin: '0 auto'
    },
    summaryHeader: {
        background: '#f0f4ff',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px'
    },
    // 상세 보기용 스타일
    detailCard: {
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #ebedef',
        marginBottom: '16px'
    },
    questionText: {
        fontWeight: 600,
        fontSize: '16px',
        marginBottom: '10px'
    },
    answerBox: {
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        fontSize: '14px',
        lineHeight: '1.6'
    }
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
    whiteSpace: 'nowrap',
    fontWeight: 600
};

// 평가 상태별 버튼 className 반환
export const getEvaluationButtonClass = ({ isLearningCompleted, isPassed, isSubmitted }) => {
    if (!isLearningCompleted) return 'btn-secondary';
    if (isPassed) return 'btn-success';
    if (isSubmitted) return 'btn-warning';
    return 'btn-primary';
};

// 평가 상태별 버튼 텍스트 반환
export const getEvaluationButtonText = ({ isLearningCompleted, isPassed, isSubmitted }) => {
    if (!isLearningCompleted) return '응시 대기';
    if (isPassed) return '통과 완료';
    if (isSubmitted) return '재응시 필요';
    return '응시하기';
};

// 평가 상태별 설명 문구 반환
export const getEvaluationStatusText = ({ isLearningCompleted, result }) => {
    if (!isLearningCompleted) return '학습 완료 후 응시 가능';
    if (result?.submitted) return `총점 ${result.totalScore} / ${result.maxScore}`;
    return '평가 미응시';
};

// 평가 상태별 서브텍스트 스타일
export const getEvaluationStatusSubText = ({ isLearningCompleted, isPassed, isSubmitted }) => ({
    ...statusSubText,
    color: !isLearningCompleted
        ? '#868e96'
        : isPassed
            ? '#198754'
            : isSubmitted
                ? '#f59f00'
                : '#321fdb'
});

// 평가 상태별 왼쪽 컬러바 스타일
export const evaluationStatusBar = ({ isLearningCompleted, isPassed, isSubmitted }) => ({
    width: '6px',
    alignSelf: 'stretch',
    borderRadius: '8px',
    backgroundColor: !isLearningCompleted
        ? '#adb5bd'
        : isPassed
            ? '#198754'
            : isSubmitted
                ? '#f59f00'
                : '#321fdb'
});

// 평가 현황 카드 내부 레이아웃
export const statusContentWrap = {
    display: 'flex',
    alignItems: 'stretch',
    gap: '12px',
    flex: 1
};

// ==============================
// 7. AI 평가 결과 상세 스타일
// ==============================
export const aiResultContainer = {
    marginTop: '16px',
    padding: '14px',
    background: '#f0f2ff', // 연한 보라/파란색 톤으로 AI 느낌 강조
    borderRadius: '10px',
    borderLeft: '4px solid #4f46e5', // 강조 라인
};

export const aiResultHeader = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 700,
    fontSize: '14px',
    color: '#4f46e5',
    marginBottom: '8px'
};

export const aiScoreText = {
    fontSize: '13px',
    color: '#374151',
    marginBottom: '4px'
};

export const similarityBadge = (score) => ({
    fontWeight: 'bold',
    color: score >= 80 ? '#10b981' : '#f59e0b', // 80점 이상은 초록, 미만은 주황
    marginLeft: '4px'
});

export const aiFeedbackBox = {
    marginTop: '8px',
    padding: '10px',
    background: '#ffffff',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#4b5563',
    lineHeight: '1.5',
    border: '1px dashed #c7d2fe'
};