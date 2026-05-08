import React from 'react';
import { PATH } from "../constants/path";

// lazy loading 적용
const Quiz = React.lazy(() => import('src/pages/evaluation/Quiz'));
const EvaluationResult = React.lazy(() => import('src/pages/evaluation/EvaluationResult'));
const QuizDetailView = React.lazy(() => import('src/pages/evaluation/QuizDetailView'));

export const  evaluationRoutes = (userInfo) => [

    // 평가 현황(사이드바 진입)
    {path: PATH.EVALUATION.ROOT, element: <Quiz /> },
    // 퀴즈 응시(로드맵에서 연결)
    { path: "/evaluation/quiz", element: <Quiz /> },
    
    // 기존 결과 페이지
    {path: PATH.EVALUATION.RESULT, element: <EvaluationResult /> },
    // 상세 결과 페이지
    {path: PATH.EVALUATION.QUIZ_DETAIL_PATTERN, element: <QuizDetailView />},
];