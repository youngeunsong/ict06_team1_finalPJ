import React from 'react';
import { PATH } from "../constants/path";
import { element } from 'prop-types';
import Calendar from 'src/pages/calendar/Calendar';
import CalendarSimpleAdd from 'src/pages/calendar/CalendarSimpleAdd';
import CalendarDetailAdd from 'src/pages/calendar/CalendarDetailAdd';
import CalendarDetail from 'src/pages/calendar/CalendarDetail';

// DefaultLayout 내부의 AppContent 자리에 렌더링될 페이지만 명시
export const calendarRoutes = (userInfo) => [
    // 형식: { path: PATH.AI.PORTAL, element: <AIPortalMain userInfo={userInfo} /> },
    { path: PATH.CALENDAR.ROOT, element: <Calendar userInfo={userInfo} />}, 
    { path: PATH.CALENDAR.SIMPLE_ADD, element: <CalendarSimpleAdd userInfo={userInfo} />}, 
    { path: PATH.CALENDAR.DETAIL_ADD, element: <CalendarDetailAdd userInfo={userInfo} />}, 
    { path: PATH.CALENDAR.DETAIL, element: <CalendarDetail userInfo={userInfo} />}, 
]; 