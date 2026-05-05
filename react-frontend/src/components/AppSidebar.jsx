import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

// 페이지 이동
import { useNavigate } from 'react-router-dom';

import {
  CAvatar,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarNav,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import navigation from '../_nav'
import { cilSearch } from '@coreui/icons'


//프로필 이미지(추후 수정)
import avatar8 from 'src/assets/images/avatars/8.jpg'
import { PATH } from 'src/constants/path';

//DefaultLayout에서 전달한 userInfo를 props로 받음
const AppSidebar = ({ userInfo }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.sidebarShow);

  //1. 권한 필터링 로직: userInfo가 없으면 기본 ROLE_USER로 설정
  const userRole = userInfo?.role || 'ROLE_USER';

  const filteredNav = navigation.filter((item) => {
    //메뉴 아이템에 roles가 정의되어 있지 않으면 모든 계정에 노출
    if(!item.roles) return true;
    //사용자 role이 메뉴의 roles 배열에 포함되어 있는지 확인
    return item.roles.includes(userRole);
  });

  return (
    <CSidebar
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >

      {/* 임시 로고: 수정 필요 */}
      <CSidebarBrand className='d-flex align-items-center justify-content-center'>
        <div
          className='sidebar-logo'
          onClick={() => navigate(PATH.AUTH.USERHOME)}
          style={{ cursor: 'pointer' }}
        >
          <span className='sidebar-logo-main'>
            🏢 함께UP 그룹웨어
          </span>
        </div>
      </CSidebarBrand>

      {/* 2. 프로필 및 검색 영역 */}
      <div className="p-3 border-bottom sidebar-profile-area">
        {/* 프로필 정보 및 알림 아이콘 */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <CAvatar src={avatar8} size="md" className="me-2" />
              <div>
                <div className="small text-secondary fw-semibold">
                  {userInfo?.department?.deptName || userInfo?.dept_name || '개발팀'}
                  / {userInfo?.position?.positionName || userInfo?.position_name || '사원'}
                </div>
                <div className="fw-semibold text-dark">
                  {userInfo?.name || '사용자'}
                </div>
              </div>
          </div>
        </div>

        {/* 검색창 */}
        <CInputGroup className="mb-2">
          <CInputGroupText className="bg-white border-secondary text-secondary">
            <CIcon icon={cilSearch} />
          </CInputGroupText>
          <CFormInput
            placeholder='Search'
            className="bg-white border-secondary text-dark"
            style={{ fontSize: '0.85rem' }}
          />
        </CInputGroup>
      </div>

        {/* 3. 사이드바 메뉴 리스트(필터링된 항목만 표시) */}
        <CSidebarNav>
          <AppSidebarNav items={filteredNav} />
        </CSidebarNav>

        {/* 사이드바 하단 토글 버튼 */}
        <CSidebarFooter className="border-top d-none d-lg-flex">
          <CSidebarToggler
            onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
          />
        </CSidebarFooter>
      </CSidebar>
  )
}

export default React.memo(AppSidebar)