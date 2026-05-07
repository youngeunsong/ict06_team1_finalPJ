/**
 * @FileName : QuizResult.js
 * @Description : 퀴즈 평가 결과 요약 화면
 *                - 총점 및 통과 여부 표시
 *                - 미통과 시 다시 풀기 버튼 제공
 * @Author : 김다솜
 * @Date : 2026. 05. 06
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.06    김다솜        Quiz.js에서 결과 요약 컴포넌트 분리
 * @ 2026.05.07    김다솜        학습 전 자기평가/이해도 분석 UI 제거
 */

import React from 'react';
import {
    summaryBox, summaryTitle, submitButton, passText, failText
} from 'src/styles/js/evaluation/QuizStyle';

const QuizResult = ({ submitResult, onRetry }) => {
    return (
        <div style={summaryBox}>
            <div style={summaryTitle}>평가 결과</div>
            <div>
                총점: {submitResult.totalScore} / {submitResult.maxScore}
            </div>

            <div style={submitResult.passed ? passText : failText}>
                결과: {submitResult.passed ? "✅ 통과" : "❌ 미통과"}
            </div>

            {!submitResult.passed && (
                <button
                    style={{ ...submitButton, marginTop: '12px' }}
                    onClick={onRetry}
                >
                    다시 풀기
                </button>
            )}
        </div>
    );
};

export default QuizResult;