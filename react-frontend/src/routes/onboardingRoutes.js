import { element } from 'prop-types';
import React from 'react';
import { PATH } from 'src/constants/path';

// lazy loading 적용

const MyRoadmap = React.lazy(() => import('src/pages/onboarding/MyRoadmap'));

export const onboardingRoutes = (userInfo) => [
    // 형식 예시: { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> },
    {path: PATH.ONBOARDING.MYROADMAP, element: <MyRoadmap userInfo={userInfo} /> }, // 로드맵

];