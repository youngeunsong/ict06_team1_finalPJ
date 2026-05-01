import React from 'react';
import { PATH } from "../constants/path";

// lazy loading 적용
const Attendance = React.lazy(() => import("../pages/attendance/Attendance"));
const AttendanceManagement = React.lazy(() => import( "../pages/attendance/AttendanceManagement"));
const CommuteProcessing = React.lazy(() => import( "../pages/attendance/CommuteProcessing"));
const AttendanceStatistics = React.lazy(() => import( "../pages/attendance/AttendanceStatistics"));
const HolidaysStatus = React.lazy(() => import( "../pages/attendance/HolidaysStatus"));

export const attendanceRoutes = (userInfo) => [
  { path: PATH.ATTENDANCE.ROOT, element: <AttendanceManagement userInfo={userInfo} /> }, // 근태 관리 페이지
  { path: PATH.ATTENDANCE.COMMUTE, element: <CommuteProcessing userInfo={userInfo} /> }, // 출퇴근 처리 페이지
  { path: PATH.ATTENDANCE.STATS, element: <AttendanceStatistics userInfo={userInfo} /> }, // 근태 통계 페이지 
  { path: PATH.ATTENDANCE.HOLIDAYS, element: <HolidaysStatus userInfo={userInfo} /> }, // 연차 현황 페이지
  // 추가 (테스트용)
  { path: "/attendance/test", element: <Attendance userInfo={userInfo} /> },

];