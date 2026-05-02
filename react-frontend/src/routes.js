import React from 'react'

const UserHome = React.lazy(() => import('./pages/auth/UserHome'))
const AIPortal = React.lazy(() => import('./pages/chatbot/Chatbot'))
const Calendar = React.lazy(() => import('./pages/calendar/Calendar'))
const Approval = React.lazy(() => import('./pages/approval/Approval'))
const MyRoadmap = React.lazy(() => import('./pages/onboarding/MyRoadmap'))
const Evaluation = React.lazy(() => import('./pages/evaluation/Quiz.js'))
const Employee = React.lazy(() => import('./pages/employee/Employee'))
const Attendance = React.lazy(() => import('./pages/attendance/Attendance'))
const Payroll = React.lazy(() => import('./pages/payroll/Payroll'))


export const routes = [
  //메인 및 기본 경로
  { path: '/auth/userhome', name: 'UserHome', element: <UserHome /> },

  //사이드바 메뉴 연결 경로
  //AI 포털
  { path: '/ai-portal', name: '사내 AI 포털', element: <AIPortal /> },

  //캘린더
  { path: '/calendar', name: '일정 관리', element: <Calendar /> },

  //전자결재
  { path: '/approval', name: '전자결재', element: <Approval /> },
  
  //인사 평가
  { path: '/onboarding/myroadmap', name: 'AI 온보딩 로드맵', element: <MyRoadmap /> },
  { path: '/evaluation', name: 'AI 평가 현황', element: <Evaluation /> },
  { path: '/evaluation/quiz', name: 'AI 퀴즈 응시', element: <Evaluation /> },
  
  //인사 관리
  { path: '/employee', name: '내 정보 및 조직도', element: <Employee /> },
  
  //근태 관리
  { path: '/attendance', name: '근태관리', element: <Attendance /> },
  
  //급여 관리
  { path: '/payroll', name: '급여관리', element: <Payroll /> },
]

export default routes