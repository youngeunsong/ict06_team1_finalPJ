import React from 'react';
import RealtimeAlert from 'src/components/RealtimeAlert';
import { PATH } from 'src/constants/path';

// DefaultLayout 내부의 AppContent 자리에 렌더링될 페이지만 명시
export const alertRoutes = (userInfo) => [
    // 형식: { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> },
    {path: PATH.ETC.ALERT, element: <RealtimeAlert userInfo={userInfo} /> }, // 대분류 : 실시간 알림
]; 