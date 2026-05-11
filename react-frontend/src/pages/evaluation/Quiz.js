/**
 * @FileName : Quiz.js
 * @Description : AI 온보딩 평가 라우팅 화면
 *                - categoryName 파라미터 유무로 평가 현황/퀴즈 응시 화면 분기
 * @Author : 김다솜
 * @Date : 2026. 04. 30
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.30    김다솜        최초 생성 및 퀴즈 조회/응시 기능 구현/스타일 코드 분리(QuizStyle.js)
 * @ 2026.05.01    김다솜        콘텐츠별 제출 구조에서 카테고리별 일괄 제출 구조로 수정,
 * @ 2026.05.01    김다솜        사이드바 진입 시 평가 현황 카드 화면 표시 구조 추가/퀴즈 전체 제출 및 결과 요약 표시
 * @ 2026.05.06    김다솜        평가 현황/퀴즈 응시/결과 요약 컴포넌트 분리
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import QuizForm from './QuizForm';
import EvaluationResult from './EvaluationResult';


const Quiz = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const categoryName = params.get("categoryName");

    // 퀴즈 조회
    if(categoryName) {
        return <QuizForm categoryName={categoryName} />;
    }

    return (
        <EvaluationResult
            headerTitle="AI 온보딩 평가"
            headerDescription="학습 완료 여부와 평가 진행 상태를 한 화면에서 확인하고 바로 응시할 수 있습니다."
        />
    );
};

export default Quiz;
