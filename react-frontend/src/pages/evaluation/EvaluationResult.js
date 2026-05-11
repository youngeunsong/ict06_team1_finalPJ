import { CSpinner } from '@coreui/react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import axiosInstance from 'src/api/axiosInstance';
import { useUser } from 'src/api/UserContext';
import { PATH } from 'src/constants/path';
import { evalResultStyles } from 'src/styles/js/evaluation/QuizStyle';

import QuizDetailView from './QuizDetailView';
import SummaryView from './SummaryView';

const EvaluationResult = ({
  headerTitle = '평가 조회',
  headerDescription = '카테고리별 평가 진행 상태와 결과를 확인합니다.',
}) => {
  const { userInfo } = useUser();
  const { resultId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roadmapGroups, setRoadmapGroups] = useState([]);

  useEffect(() => {
    if (!userInfo?.empNo) return;

    const fetchResults = async () => {
      try {
        const [resultRes, roadmapRes] = await Promise.all([
          axiosInstance.get(PATH.API.EVALUATION.QUIZ_RESULT(userInfo.empNo)),
          axiosInstance.get(PATH.API.ONBOARDING.ROADMAP(userInfo.empNo)),
        ]);

        setResults(Array.isArray(resultRes.data) ? resultRes.data : []);
        setRoadmapGroups(roadmapRes.data?.recommended_roadmap || []);
      } catch (err) {
        console.error('evaluation result load failed', err);
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
        <p className="mt-3">결과를 불러오는 중입니다.</p>
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
          headerTitle={headerTitle}
          headerDescription={headerDescription}
        />
      )}
    </div>
  );
};

export default EvaluationResult;
