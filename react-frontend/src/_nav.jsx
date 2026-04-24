//사이드바
import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilCalculator, cilCalendar, cilChatBubble, cilClock, cilDescription, cilHome, cilPeople, cilUser } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: '사내 AI 포털',
    to: '/aiSecretary/ai-portal',
    icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
    badge: {
      color: 'primary',
      text: 'AI',
    },
  },
  {
    component: CNavItem,
    name: '홈 피드',
    to: '/auth/userhome',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '일정 관리',
    to: '/calendar',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '전자결재',
    to: '/approval',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: '인사 관리',
  },
  {
    component: CNavItem,
    name: '내 정보 및 조직도',
    to: '/employee',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: '인사 평가',
  },
  {
    component: CNavItem,
    name: 'AI 온보딩 로드맵',
    to: '/onboarding/myroadmap',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'AI 퀴즈 및 평가',
    to: '/evaluation/quiz',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: '업무 지원',
  },
  {
    component: CNavItem,
    name: '근태관리',
    to: '/attendance',
    icon: <CIcon icon={cilClock} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '급여관리',
    to: '/payroll',
    icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
  },
]

export default _nav