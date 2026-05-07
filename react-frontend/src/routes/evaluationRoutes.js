import React from 'react';
import { PATH } from "../constants/path";
import Quiz from 'src/pages/evaluation/Quiz';

// lazy loading 적용
const Evaluation2 = React.lazy(() => import('src/pages/evaluation/Evaluation2'));

export const  evaluationRoutes = (userInfo) => [

    {path: PATH.EVALUATION.ROOT, element: <Quiz userInfo={userInfo} /> },        // 평가 현황
    {path: PATH.EVALUATION.QUIZ, element: <Quiz userInfo={userInfo} /> },               // 퀴즈 응시
    {path: PATH.EVALUATION.RESULT, element: <Evaluation2 userInfo={userInfo} /> },      // 평가 결과 조회
];