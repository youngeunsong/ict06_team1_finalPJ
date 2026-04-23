import React from 'react';
import { PATH } from "../constants/path";

// lazy loading 적용
const AIPortalMain = React.lazy(() => import('src/pages/AIPortalMain'));

export const aiPortalRoutes = (userInfo) => [
    { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> }, // 사내 AI 포털 메인
];