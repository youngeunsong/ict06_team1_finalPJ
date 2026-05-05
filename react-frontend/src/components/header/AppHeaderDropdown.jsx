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
import {
  cilLockLocked,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'

import { NavLink, useNavigate } from 'react-router-dom'
import { useUser } from 'src/api/UserContext'
import { PATH } from 'src/constants/path'
import { modalBodyStyle, modalFooterStyle, modalHeaderStyle, modalIconStyle, modalSubTextStyle, modalTextStyle, modalTitleStyle, toastBodyStyle, toastIconStyle, toastStyle } from 'src/styles/js/common/HeaderStyle'

const AppHeaderDropdown = () => {
  const navigate = useNavigate();
  const { logout } = useUser();
  const [logoutModal, setLogoutModal] = useState(false);
  const [toast, addToast] = useState(null);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
    setLogoutModal(false);
    
    //토스트 메시지
    addToast(
      <CToast autohide={true} delay={1500} style={toastStyle}>
        <CToastBody style={toastBodyStyle}>
          <span style={toastIconStyle}>✅</span>
          <span>로그아웃 되었습니다.</span>
        </CToastBody>
      </CToast>
    );
    
    setTimeout(() => {
      navigate(PATH.AUTH.LOGIN);
    }, 1500);
  };
    
  return (
    <>
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
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
          style={{ cursor: 'pointer', userSelect: 'none', width: '100%', textAlign: 'left' }}
        >
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>

    {/* 로그아웃 확인 모달 */}
    <CModal alignment='center' visible={logoutModal} onClose={() => setLogoutModal(false)}>
      <CModalHeader style={modalHeaderStyle}>
          <CModalTitle style={modalTitleStyle}>로그아웃</CModalTitle>
        </CModalHeader>
        <CModalBody style={modalBodyStyle}>
          <div style={modalIconStyle}>🚪</div>
          <p style={modalTextStyle}>로그아웃 하시겠습니까?</p>
          <small style={modalSubTextStyle}>로그아웃 후 로그인 페이지로 이동합니다.</small>
        </CModalBody>
        <CModalFooter style={modalFooterStyle}>
          <CButton
            className='btn-custom btn-secondary-custom'
            onClick={() => setLogoutModal(false)}
          >
            취소
          </CButton>
          <CButton
            className='btn-custom btn-primary-custom'
            onClick={handleLogout}
          >
            로그아웃
          </CButton>
        </CModalFooter>
    </CModal>
    {/* 토스트 */}
    <CToaster push={toast} placement="top-center" />
    </>
  )
};

export default AppHeaderDropdown;