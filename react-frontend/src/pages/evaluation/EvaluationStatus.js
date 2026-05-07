/**
 * @FileName : EvaluationStatus.js
 * @Description : AI 온보딩 평가 현황 화면
 *                - 카테고리별 평가 응시 현황 카드 표시
 *                - 로드맵 학습 완료 카테고리 기준 응시 가능 여부 분기
 * @Author : 김다솜
 * @Date : 2026. 05. 06
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.06    김다솜        Quiz.js에서 평가 현황 컴포넌트 분리, isDirectQuizMode 의존성 제거
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from 'src/api/axiosInstance';
import { useUser } from 'src/api/UserContext';
import { PATH } from 'src/constants/path';
import {
    quizContainer, quizHeader, categoryText,
    statusGrid, statusTitle, statusCard,
    statusButton, statusContentWrap,
    evaluationStatusBar,
    getEvaluationStatusText,
    getEvaluationButtonClass,
    getEvaluationStatusSubText,
} from 'src/styles/js/evaluation/QuizStyle';

const categories = [
    '필수이수교육',
    '직무교육 (백엔드)',
    '직무교육 (프론트엔드)',
    '심화교육',
    'AI 활용 교육',
];

const EvaluationStatus = () => {
    const { userInfo } = useUser();
    const navigate = useNavigate();

    const [evaluationResults, setEvaluationResults] = useState([]);
    const [completedCategories, setCompletedCategories] = useState([]);

    // 평가 결과 조회
    useEffect(() => {
        if (!userInfo?.empNo)
            return;

        const fetchEvaluationResults = async () => {
            try {
                const res = await axiosInstance.get(
                    PATH.API.EVALUATION.QUIZ_RESULT(userInfo.empNo)
                );

                console.log("[Evaluation] result:", res.data);
                setEvaluationResults(res.data);
            } catch (err) {
                console.error("평가 결과 조회 실패", err);
            }
        };

        fetchEvaluationResults();
    }, [userInfo?.empNo]);

    // 로드맵 학습 완료 카테고리 조회
    useEffect(() => {
        if (!userInfo?.empNo)
            return;

        const fetchRoadmap = async () => {
            try {
                const res = await axiosInstance.get(
                    PATH.API.ONBOARDING.ROADMAP(userInfo.empNo)
                );

                const roadmapGroups = res.data?.recommended_roadmap || [];

                const completed = roadmapGroups
                    .filter(group =>
                        group.items.every(item => item.status === 'COMPLETED')
                    )
                    .map(group => group.category_name);

                console.log("[Evaluation] completed categories:", completed);

                setCompletedCategories(completed);
            } catch (err) {
                console.error("로드맵 조회 실패", err);
            }
        };

        fetchRoadmap();
    }, [userInfo?.empNo]);

    return (
        <div style={quizContainer}>
            <div style={quizHeader}>
                <h2>📝 AI 퀴즈 및 평가</h2>
                <p style={categoryText}>
                    로드맵에서 학습을 완료한 카테고리의 퀴즈를 응시할 수 있습니다.
                </p>
            </div>

            <div style={statusGrid}>
                {categories.map((category) => {
                    // 해당 카테고리의 기존 평가결과 조회
                    const result = evaluationResults.find(
                        (item) => item.categoryName === category
                    );

                    // 학습 완료 여부
                    const isLearningCompleted = completedCategories.includes(category);

                    // 학습 완료 아닌 경우: result 데이터가 있어도 미완료 상태로 간주
                    const hasPassed = isLearningCompleted && result?.passed;
                    const hasSubmitted = isLearningCompleted && result?.submitted;

                    return (
                        <div key={category} style={statusCard}>
                            <div style={statusContentWrap}>
                                <div
                                    style={evaluationStatusBar({
                                        isLearningCompleted,
                                        isPassed: hasPassed,
                                        isSubmitted: hasSubmitted
                                    })}
                                />

                                <div>
                                    <div style={statusTitle}>{category}</div>
                                    <div style={getEvaluationStatusSubText({
                                        isLearningCompleted,
                                        isPassed: hasPassed,
                                        isSubmitted: hasSubmitted
                                    })}
                                    >
                                        {getEvaluationStatusText({
                                            isLearningCompleted,
                                            result: isLearningCompleted ? result : null
                                        })}
                                    </div>
                                </div>
                            </div>

                            <button
                                className={`btn btn-sm ${getEvaluationButtonClass({
                                    isLearningCompleted,
                                    isPassed: hasPassed,
                                    isSubmitted: hasSubmitted
                                })}`}
                                style={statusButton}
                                disabled={!isLearningCompleted}
                                onClick={() => {
                                    if(isLearningCompleted && hasPassed) {
                                        // 통과한 경우: 결과 상세 페이지로 이동
                                        navigate(PATH.EVALUATION.RESULT);
                                        // navigate(PATH.EVALUATION.QUIZ_DETAIL(userInfo.empNo, category));
                                    } else if(isLearningCompleted) {
                                        // 미응시 또는 재응시 필요한 경우: 퀴즈 페이지로 이동
                                        navigate(PATH.EVALUATION.QUIZ + `?categoryName=${encodeURIComponent(category)}`);
                                    }
                                }}
                            >
                                {!isLearningCompleted
                                    ? '학습 미완료'
                                    : (hasPassed ? '결과 조회' : '응시하기')}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EvaluationStatus;