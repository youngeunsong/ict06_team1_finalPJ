/**
 * @FileName : EvaluationResult.js
 * @Description : 평가 결과 조회 화면
 *                - 카테고리별 퀴즈 평가 결과 조회
 *                - 총점/만점/통과 여부 카드 표시
 *                - 전체 통과 카테고리 수 요약
 * @Author : 김다솜
 * @Date : 2026. 05. 06
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.06    김다솜        최초 생성 및 평가 결과 조회 화면 구현
 */

import React, { useEffect, useState } from 'react';
import { CSpinner } from '@coreui/react';
import axiosInstance from 'src/api/axiosInstance';
import { useUser } from 'src/api/UserContext';
import { PATH } from 'src/constants/path';
import { useParams } from 'react-router-dom';
import QuizDetailView from './QuizDetailView';
import SummaryView from './SummaryView';
import { evalResultStyles } from 'src/styles/js/evaluation/QuizStyle';

const EvaluationResult = () => {
    const { userInfo } = useUser();
    const { resultId }  = useParams(); // URL에서 :resultId 추출
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roadmapGroups, setRoadmapGroups] = useState([]);

    useEffect(() => {
        if (!userInfo?.empNo) return;

        const fetchResults = async () => {
            try {
                const [resultRes, roadmapRes] = await Promise.all([
                    axiosInstance.get(PATH.API.EVALUATION.QUIZ_RESULT(userInfo.empNo)),
                    axiosInstance.get(PATH.API.ROADMAP(userInfo))
                ]);

                console.log("[EvaluationResult] 결과:", resultRes.data);
                console.log("[EvaluationResult] 로드맵 그룹:", roadmapRes.data);

                setResults(resultRes.data);

                setRoadmapGroups(roadmapRes.data?.recommended_roadmap || []);
            } catch (err) {
                console.error("평가 결과 조회 실패", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [userInfo?.empNo]);

    if (loading) {
        return (
            <div className="text-center py-5">
                <CSpinner color="primary" />
                <p className="mt-3">결과를 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div style={evalResultStyles.container}>
            {resultId ? (
                <QuizDetailView resultId={resultId} />
            ) : (
                <SummaryView
                    results={results}
                    roadmapGroups={roadmapGroups}
                    userName={userInfo?.name}
                    styles={evalResultStyles}
                 />
            )}
        </div>
    );
};

export default EvaluationResult;