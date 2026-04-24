import React from 'react';
import { PATH } from "../constants/path";

// lazy loading 적용
const Evaluation = React.lazy(() => import('src/pages/evaluation/Evaluation'));
const Evaluation2 = React.lazy(() => import('src/pages/evaluation/Evaluation2'));

export const  evaluationRoutes = (userInfo) => [

    {path: PATH.ONBOARDING.QUIZ, element: <Evaluation userInfo={userInfo} /> }, // 퀴즈
    {path: PATH.ONBOARDING.EVALUATION, element: <Evaluation2 userInfo={userInfo} /> }, // 평가
];
