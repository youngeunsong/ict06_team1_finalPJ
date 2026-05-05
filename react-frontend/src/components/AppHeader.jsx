import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CContainer, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CHeader, CHeaderNav, CHeaderToggler, CNavLink, CNavItem, useColorModes,
  CBadge,
  CDropdownHeader,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CListGroup,
  CListGroupItem, } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilMenu, } from '@coreui/icons'

import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import AppBreadcrumb from './AppBreadcrumb.jsx'
import AppHeaderDropdown from './header/AppHeaderDropdown.jsx'
import { PATH } from 'src/constants/path.js'
import { headerNavLink, headerQuickNav } from 'src/styles/js/common/HeaderStyle.js'
import axiosInstance from 'src/api/axiosInstance.js'

const AppHeader = () => {
  const headerRef = useRef()
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  //1. 읽지 않은 알림 개수, 알림 목록
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([])
  
  //2. 초기 알림 개수 가져오기
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      if(!token)
        return

      const response = await axiosInstance.get("/noti");

      //최근 알림이 가장 위에 보이도록 정렬
      const sortedData = [...response.data].reverse();
      setNotifications(sortedData);

      //읽지 않은 알림 개수 계산
      const unread = response.data.filter(noti => noti.isRead === false).length;
      setUnreadCount(unread)
    } catch(error) {
      console.error("알림 로드 실패: ", error)
    }
  }

  //알림 클릭 시 읽음 처리 요청 핸들러
  const handleNotiClick = async (notiId, url) => {
    console.log("클릭된 알림 ID:", notiId); // 이게 undefined면 key나 필드명 문제!
    console.log("이동할 URL:", url);
    try {
      const token = localStorage.getItem('token');
      if(!token)
        return;

      //1. 백엔드 호출: NotificationController > markAsRead()
      await axios.patch(`${PATH.API.BASE}/noti/${notiId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      //2. 읽음 처리 성공 시 목록 갱신
      fetchNotifications();

      //3. 알림에 연결된 url 있는 경우 해당 페이지로 이동
      if(url) navigate(url)
    } catch(error) {
      console.error("알림 읽음 처리 실패: ", error)
    }
  }

  //3. 페이지 로드 시 실시간 업데이트
  useEffect(() => {
    //페이지 진입 시 초기 데이터 호출
    fetchNotifications()

    //Noti리스너에서 보낸 커스텀 이벤트 감지
    //새 알림 오면 목록 다시 불러오기
    const handleNewNoti = () => fetchNotifications()
    window.addEventListener('newNotification', handleNewNoti)
    
    //스크롤 이벤트
    const handleScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }
    document.addEventListener('scroll', handleScroll)

    return() => {
      window.removeEventListener('newNotification', handleNewNoti)
      document.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>

        {/* 사이드바 토글 버튼 */}
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <CHeaderNav className='d-none d-md-flex ms-3' style={headerQuickNav}>
          <CNavItem>
            <CNavLink style={headerNavLink} onClick={() => navigate(PATH.AUTH.USERHOME)}>
              HOME
            </CNavLink>
          </CNavItem>
        </CHeaderNav>

        {/* 우측 메뉴 */}
        <CHeaderNav className='ms-auto'>

          {/* 알림 아이콘 */}
          <CDropdown variant='nav-item' placement='bottom-end'>
            {/* 알림 & 배지(클릭 시 드롭다운 오픈) */}
            <CDropdownToggle
              caret={false}
              as={CNavLink}
              className='nav-link d-flex align-items-center position-relative'
              style={{ cursor: 'pointer' }}
            >
                <CIcon icon={cilBell} size='lg' style={{ verticalAlign: 'middle' }} />
                {unreadCount > 0 && (
                  <CBadge
                    color='danger'
                    shape='rounded-pill'
                    className='position-absolute top-0 start-100 translate-middle'
                    style={{ fontSize: '10px', padding: '4px 6px' }}
                  >
                    {unreadCount}
                  </CBadge>
                )}
            </CDropdownToggle>

            {/* 알림 목록 드롭다운 */}
            <CDropdownMenu className='pt-0' style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
              <CDropdownHeader className='bg-light fw-semibold py-2'>
                최근 알림
              </CDropdownHeader>

              {notifications.length === 0 ? (
                <CDropdownItem className='text-center py-3 text-muted'>
                  알림 내역이 없습니다.
                </CDropdownItem>
              ) : (
                notifications.map((noti) => (
                  <CDropdownItem
                    key={noti.notiId}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNotiClick(noti.notiId, noti.url);
                    }}
                    className='py-2 border-bottom'
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: noti.isRead === true ? 'transparent' : '#f4f7ff'
                    }}
                  >
                    <div className='d-flex flex-column'>
                      <span className={noti.isRead === true ? 'text-muted' : 'fw-bold'} style={{ fontSize: '14px' }}>
                        {noti.content}
                      </span>
                      <small className='text-muted' style={{ fontSize: '11px' }}>
                        {noti.createdAt ? new Date(noti.createdAt).toLocaleDateString() : "시간 정보 없음"}
                      </small>
                    </div>
                  </CDropdownItem>
                ))
              )}

              <CDropdownItem 
                onClick={() => setVisible(true)}
                className='text-center fw-bold text-primary py-2'
                style={{ cursor: 'pointer' }}
                >
                전체 알림 보기
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>

          {/* 프로필 드롭다운 */}
          {/* <CNavItem> */}
            <AppHeaderDropdown />
          {/* </CNavItem> */}

        </CHeaderNav>
      </CContainer>
      
      {/* 전체 알림 내역 모달 */}
      <CModal
        visible={visible}
        onClose={() => setVisible(false)}
        scrollable
        size='lg'
        //backdrop='static' //바깥 클릭해도 닫히지 않게 설정
      >
        <CModalHeader>
          <CModalTitle>전체 알림 내역</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CListGroup flush>
            {notifications.length === 0 ? (
              <p className='text-center py-5 text-muted'>알림 내역이 없습니다.</p>
            ) : (
              notifications.map((noti) => (
                <CListGroupItem
                  key={noti.notiId}
                  className='d-flex justify-content-between align-items-center py-3'
                  style={{ backgroundColor: noti.isRead === true ? 'transparent' : '#f8f9ff' }}
                >
                  <div
                    style={{ cursor: 'pointer', flex: 1 }}
                    onClick={(e) => {
                      e.preventDefault();
                      setVisible(false);  //모달 닫기
                      handleNotiClick(noti.notiId, noti.url); //읽음처리 및 이동
                    }}
                  >
                    <div className={noti.isRead === true ? 'text-muted' : 'fw-bold'}>
                      {noti.content}
                    </div>
                    <small className='text-muted'>
                      {new Date(noti.createdAt).toLocaleString()}
                    </small>
                  </div>
                </CListGroupItem>
              ))
            )}
          </CListGroup>
        </CModalBody>
      </CModal>

      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader;