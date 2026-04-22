import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CAvatar,
  CCloseButton,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarNav,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import navigation from '../_nav'
import { cilBell, cilSearch } from '@coreui/icons'

import avatar8 from 'src/assets/images/avatars/8.jpg'

const AppSidebar = ({ userInfo }) => {
  const userName = userInfo?.name;
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.sidebarShow);

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          <div className="fw-bold" style={{ fontSize: '1.2rem' }}>ICTO6 TEAM1</div>
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>

      {/* 프로필 및 검색 영역 */}
      <div className="p-3 border-bottom sidebar-profile-area">
        {/* 프로필 정보 및 알림 아이콘 */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <CAvatar src={avatar8} size="md" className="me-2" />
              <div>
                <div className="small text-white-50">개발팀 / 사원</div>
                <div className="fw-semibold">{userInfo?.name}</div>
              </div>
          </div>
          <CIcon icon={cilBell} size="lg" className="text-white-50" style={{ cursor: 'pointer' }} />
        </div>

        {/* 검색창 */}
        <CInputGroup className="mb-2">
          <CInputGroupText className="bg-dark border-secondary text-white-50">
            <CIcon icon={cilSearch} />
          </CInputGroupText>
          <CFormInput
            placeholder='Search'
            className="bg-dark border-secondary text-white"
            style={{ fontSize: '0.85rem' }}
          />
        </CInputGroup>
      </div>

        {/* 사이드바 메뉴 리스트 */}
        <CSidebarNav>
          <AppSidebarNav items={navigation} />
          {/* 사이드바 하단 토글 버튼 */}
          <CSidebarFooter className="border-top d-none d-lg-flex">
            <CSidebarToggler
              onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
            />
          </CSidebarFooter>
        </CSidebarNav>
      </CSidebar>
  )
}

export default React.memo(AppSidebar)