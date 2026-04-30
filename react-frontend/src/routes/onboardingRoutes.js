// routes/onboardingRoutes.js
import React from 'react';
import { PATH } from 'src/constants/path';
import Checklist from 'src/pages/onboarding/Checklist';

// lazy loading 적용

const MyRoadmap = React.lazy(() => import('src/pages/onboarding/MyRoadmap'));
const LearningDetail = React.lazy(() => import('src/pages/onboarding/LearningDetail'));

export const onboardingRoutes = (userInfo) => [
    // 형식 예시: { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> },
    {path: PATH.ONBOARDING.ROADMAP, element: <MyRoadmap userInfo={userInfo} /> }, // 로드맵
    {path: PATH.ONBOARDING.LEARNING_DETAIL, element: <LearningDetail userInfo={userInfo} /> }, // 콘텐츠 상세페이지
    {path: PATH.ONBOARDING.CHECKLIST, element: <Checklist userInfo={userInfo} /> }, // 체크리스트

];