/**
 * @FileName : _nav.jsx
 * @Description : 사이드바 메뉴
 * @Author : 김다솜
 * @Date : 2026. 04. 21
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.21    김다솜        화면설계와 맞추어 사이드바 메뉴 생성
 * @ 2026.04.22    김다솜        메뉴별 접근 권한 설정 예시 추가(roles)
 */
import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilCalculator, cilCalendar, cilChatBubble, cilClock, cilDescription, cilHome, cilPeople, cilUser } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'
import { PATH } from './constants/path'

const _nav = [
  {
    component: CNavItem,
    name: '사내 AI 포털',
    to: '/ai-portal',
    icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
    badge: {
      color: 'primary',
      text: 'AI',
    },
  },
  {
    component: CNavItem,
    name: '홈 피드',
    to: PATH.AUTH.USERHOME,
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
    to: PATH.ONBOARDING.ROADMAP,
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    badge: {
      color: 'primary',
      text: 'AI',
    },
  },
  {
    component: CNavItem,
    name: 'AI 퀴즈 및 평가',
    to: '/evaluation/quiz',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    badge: {
      color: 'primary',
      text: 'AI',
    },
  },
  {
    component: CNavItem,
    name: '평가 조회',
    to: '/evaluation/result',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '평가 관리',
    to: '/evaluation/admin',
    icon: <CIcon icon={cilPeople} customClasqsName="nav-icon" />,
    roles: ['ROLE_TEAM_LEADER', 'ROLE_ADMIN'],
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