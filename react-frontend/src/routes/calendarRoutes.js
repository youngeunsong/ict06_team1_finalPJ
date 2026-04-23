import React from 'react';
import { PATH } from "../constants/path";


// lazy loading 적용
const Calendar = React.lazy(() => import( 'src/pages/calendar/Calendar'));
const CalendarSimpleAdd = React.lazy(() => import( 'src/pages/calendar/CalendarSimpleAdd'));
const CalendarDetailAdd = React.lazy(() => import( 'src/pages/calendar/CalendarDetailAdd'));
const CalendarDetail = React.lazy(() => import( 'src/pages/calendar/CalendarDetail'));

// DefaultLayout 내부의 AppContent 자리에 렌더링될 페이지만 명시
export const calendarRoutes = (userInfo) => [
    // 형식: { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> },
    { path: PATH.CALENDAR.ROOT, element: <Calendar userInfo={userInfo} />},  // 캘린더 메인 페이지
    { path: PATH.CALENDAR.SIMPLE_ADD, element: <CalendarSimpleAdd userInfo={userInfo} />}, // 일정 간단 등록 페이지
    { path: PATH.CALENDAR.DETAIL_ADD, element: <CalendarDetailAdd userInfo={userInfo} />}, // 상세 등록 / 반복 / 참석자 일정 페이지
    { path: PATH.CALENDAR.DETAIL, element: <CalendarDetail userInfo={userInfo} />}, // 일정 상세/삭제 페이지
]; 