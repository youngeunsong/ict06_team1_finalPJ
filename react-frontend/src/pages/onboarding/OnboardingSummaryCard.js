/**
 * @FileName : OnboardingSummaryCard.js
 * @Description : 온보딩 요약 카드 컴포넌트
 *                - 홈 화면에서 학습 진행률, 완료 교육 수, 평가 현황 요약 표시
 * @Author : 김다솜
 * @Date : 2026. 05. 06
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.06    김다솜        최초 생성 및 온보딩 요약 카드 구현
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from 'src/api/axiosInstance';
import { useUser } from 'src/api/UserContext';
import { PATH } from 'src/constants/path';
import { summaryTitle } from 'src/styles/js/evaluation/QuizStyle';
import { progressFill, progressTrack, summaryCard, summaryDesc, summaryGrid, summaryHeader, summaryItemLabel, summaryPercent } from 'src/styles/js/onboarding/DashboardStyle';

const OnboardingSummaryCard = () => {
    const navigate = useNavigate();
    const { userInfo } = useUser();
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        if(!userInfo?.empNo)
            return;

        const fetchSummary = async () => {
            try {
                const res = await axiosInstance.get(
                    PATH.API.ONBOARDING.DASHBOARD(userInfo.empNo)
                );
                setSummary(res.data);
            } catch (err) {
                console.error("[OnboardingSummaryCard] 요약 조회 실패", err);
            }
        };
        fetchSummary();
    }, [userInfo?.empNo]);

    return (
        <div style={summaryCard}>
            <div style={summaryHeader}>
                <div>
                    <h5 style={summaryTitle}>📚 온보딩 진행 현황</h5>
                    <div style={summaryDesc}>
                        학습과 평가 진행 상황을 한눈에 확인하세요.
                    </div>
                </div>

                <div style={summaryPercent}>
                    {summary?.learningProgressPercent ?? 0}%
                </div>
            </div>

            <div style={progressTrack}>
                <div style={progressFill(summary?.learningProgressPercent ?? 0)} />
            </div>

            <div style={summaryGrid}>
                <div>
                    <div style={summaryItemLabel}>완료 카테고리</div>
                    <strong>{summary?.completedCategoryCount ?? 0} / {summary?.totalCategoryCount ?? 0}</strong>
                </div>

                <div>
                    <div style={summaryItemLabel}>완료 콘텐츠</div>
                    <strong>{summary?.completedLearningCount ?? 0} / {summary?.totalLearningCount ?? 0}</strong>
                </div>

                <div>
                    <div style={summaryItemLabel}>응시한 평가</div>
                    <strong>{summary?.submittedEvaluationCount ?? 0}개</strong>
                </div>

                <div>
                    <div style={summaryItemLabel}>평가 통과율</div>
                    <strong>{summary?.evaluationPassRatePercent ?? 0}%</strong>
                </div>
            </div>

            <button
                className='btn btn-sm btn-primary mt-3'
                onClick={() => navigate(PATH.ONBOARDING.DASHBOARD)}
            >
                자세히 보기 &gt;
            </button>
        </div>
    );
};

export default OnboardingSummaryCard;