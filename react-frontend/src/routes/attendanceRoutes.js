import { PATH } from "../constants/path";
import AttendanceManagement from "../pages/attendance/AttendanceManagement";
import CommuteProcessing from "../pages/attendance/CommuteProcessing";
import AttendanceStatistics from "../pages/attendance/AttendanceStatistics";
import HolidaysStatus from "../pages/attendance/HolidaysStatus";

export const attendanceRoutes = (userInfo) => [
  { path: PATH.ATTENDANCE.ROOT, element: <AttendanceManagement userInfo={userInfo} /> },
  { path: PATH.ATTENDANCE.COMMUTE, element: <CommuteProcessing userInfo={userInfo} /> },
  { path: PATH.ATTENDANCE.STATS, element: <AttendanceStatistics userInfo={userInfo} /> },
  { path: PATH.ATTENDANCE.HOLIDAYS, element: <HolidaysStatus userInfo={userInfo} /> },
];