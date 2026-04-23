import { element } from 'prop-types';
import React from 'react';
import { PATH } from 'src/constants/path';
import Evaluation from 'src/pages/evaluation/Evaluation';
import Evaluation2 from 'src/pages/evaluation/Evaluation2';
import MyRoadmap from 'src/pages/onboarding/MyRoadmap';

export const onboardingRoutes = (userInfo) => [
    // 형식 예시: { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> },
    {path: PATH.ONBOARDING.MYROADMAP, element: <MyRoadmap userInfo={userInfo} /> }, 
    {path: PATH.ONBOARDING.QUIZ, element: <Evaluation userInfo={userInfo} /> }, 
    {path: PATH.ONBOARDING.MYROADMAP, element: <Evaluation2 userInfo={userInfo} /> }, 
];