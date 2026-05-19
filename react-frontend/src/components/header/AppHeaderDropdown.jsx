/**
 * @FileName : AppHeaderDropdown.jsx
 * @Description : 헤더 사용자 드롭다운 및 로그아웃 확인 모달 컴포넌트
 * @Author : 김다솜
 * @Date : 2026. 05. 18
 * @Modification_History
 * @
 * @ 수정일자        수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.18    김다솜        로그아웃 모달을 홈/웰컴/사내 AI 포털 톤으로 개선하고 스타일 파일 분리
 * @ 2026.05.19    김다솜        헤더 기본 프로필 이미지 제거
 */

import React, { useState } from 'react'
import {
  CAvatar,
  CButton,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CToast,
  CToastBody,
  CToaster,
} from '@coreui/react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import { NavLink, useNavigate } from 'react-router-dom'
import { useUser } from 'src/api/UserContext'
import { PATH } from 'src/constants/path'
import {
  dropdownLogoutItemStyle,
  logoutCancelButtonStyle,
  logoutConfirmButtonStyle,
  logoutMessageCardStyle,
  logoutMessageStyle,
  logoutModalBodyStyle,
  logoutModalContentStyle,
  logoutModalDialogStyle,
  logoutModalEyebrowStyle,
  logoutModalFooterStyle,
  logoutModalHeaderStyle,
  logoutModalIconStyle,
  logoutModalTitleStyle,
  logoutModalTitleWrapStyle,
  logoutSubTextStyle,
  logoutToastBodyStyle,
  logoutToastIconStyle,
  logoutToastStyle,
} from 'src/styles/js/auth/LogoutStyle'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const { logout } = useUser()
  const [logoutModal, setLogoutModal] = useState(false)
  const [toast, addToast] = useState(null)

  const handleLogout = () => {
    localStorage.removeItem('token')
    logout()
    setLogoutModal(false)

    // 로그아웃 완료 안내를 토스트로 짧게 보여준 뒤 로그인 화면으로 이동한다.
    addToast(
      <CToast autohide={true} delay={1500} style={logoutToastStyle}>
        <CToastBody style={logoutToastBodyStyle}>
          <span style={logoutToastIconStyle}>✓</span>
          <span>로그아웃되었습니다.</span>
        </CToastBody>
      </CToast>,
    )

    setTimeout(() => {
      navigate(PATH.AUTH.LOGIN)
    }, 1500)
  }

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
          <CAvatar color="secondary" textColor="white" size="md">
            <CIcon icon={cilUser} />
          </CAvatar>
        </CDropdownToggle>
        <CDropdownMenu className="pt-0" placement="bottom-end">
          <CDropdownHeader className="bg-body-secondary fw-semibold my-2">내 계정</CDropdownHeader>
          <CDropdownItem as={NavLink} to={PATH.AUTH.MYPAGE}>
            <CIcon icon={cilUser} className="me-2" />
            마이페이지
          </CDropdownItem>
          <CDropdownDivider />
          <CDropdownItem
            component="button"
            onClick={() => setLogoutModal(true)}
            style={dropdownLogoutItemStyle}
          >
            <CIcon icon={cilLockLocked} className="me-2" />
            Logout
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      {/* 로그아웃 확인 모달 */}
      <CModal
        alignment="center"
        visible={logoutModal}
        onClose={() => setLogoutModal(false)}
        contentClassName="border-0"
        style={logoutModalDialogStyle}
      >
        <div style={logoutModalContentStyle}>
          <CModalHeader style={logoutModalHeaderStyle}>
            <div style={logoutModalTitleWrapStyle}>
              <span style={logoutModalIconStyle}>
                <CIcon icon={cilLockLocked} />
              </span>
              <div>
                <p style={logoutModalEyebrowStyle}>SESSION</p>
                <CModalTitle style={logoutModalTitleStyle}>로그아웃할까요?</CModalTitle>
              </div>
            </div>
          </CModalHeader>
          <CModalBody style={logoutModalBodyStyle}>
            <div style={logoutMessageCardStyle}>
              <p style={logoutMessageStyle}>현재 계정에서 로그아웃합니다.</p>
              <small style={logoutSubTextStyle}>
                진행 중인 작업이 있다면 저장 여부를 한 번 더 확인해 주세요. 로그아웃 후 로그인
                페이지로 이동합니다.
              </small>
            </div>
          </CModalBody>
          <CModalFooter style={logoutModalFooterStyle}>
            <CButton style={logoutCancelButtonStyle} onClick={() => setLogoutModal(false)}>
              취소
            </CButton>
            <CButton style={logoutConfirmButtonStyle} onClick={handleLogout}>
              로그아웃
            </CButton>
          </CModalFooter>
        </div>
      </CModal>

      {/* 토스트 */}
      <CToaster push={toast} placement="top-center" />
    </>
  )
}

export default AppHeaderDropdown
