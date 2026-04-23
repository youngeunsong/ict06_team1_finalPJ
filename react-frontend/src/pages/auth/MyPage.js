/**
 * @FileName : MyPage.js
 * @Description : 마이페이지(내 정보 조회/수정)
 * @Author : 김다솜
 * @Date : 2026. 04. 22
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.22    김다솜        최초 생성/화면 구성
 */

import { CAvatar, CBadge, CButton, CCard, CCardBody, CCol, CNav, CNavItem, CNavLink, CRow } from '@coreui/react';
import React, { useEffect, useState } from 'react';

import CIcon from '@coreui/icons-react';
import { cilPencil } from '@coreui/icons';
import { useUser } from 'src/api/UserContext';

const MyPage = () => {
    const { userInfo } = useUser();

    //수정 가능한 상태값 관리
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        empNo: '',
        profileImg: '',
    })

    useEffect(() => {
        if (userInfo) {
            setFormData({
                name: userInfo.name || '',
                email: userInfo.email || '',
                empNo: userInfo.empNo || '',
                profile_img: userInfo.profile_img || '',
            })
        }
    }, [userInfo]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleUpdate = () => {
        console.log('수정 데이터: ', formData)
        alert('정보가 수정되었습니다.')
    }

    return (
        <CRow>
            <CCol xs={12}>
                {/* 상단 프로필 헤더 영역 */}
                <CCard className='mb-4 border-0 shadow-sm'>
                    <div className='profile-header-bg'
                        style={{
                            height: '150px',
                            background: 'linear-gradient(to right, #ffafbd, #ffc3a0)',
                            borderRadius: '0.375rem 0.375rem 0 0'
                        }}></div>
                    <CCardBody className='pt-0'>
                        <div className='d-flex align-items-end'
                            style={{ marginTop: '-50px' }}>
                            <CAvatar src={userInfo?.profile_img || 'avatars/8.jpg'}
                                size="xl"
                                className="border border-4 border-white shadow"
                                style={{
                                    width: '100px', height: '100px'
                                }}
                            />
                            <div className='ms-3 mb-2'>
                                <h4 className='mb-0 fw-bold'>{userInfo?.name}</h4>
                                <div className='text-muted small'>{userInfo?.dept_name || '직무·부서 없음'}</div>
                            </div>
                        </div>

                        {/* 탭 메뉴 영역 */}
                        <CNav variant='tabs' className='mt-4 border-bottom-0'>
                            <CNavItem><CNavLink active href='#'>정보</CNavLink></CNavItem>
                            <CNavItem><CNavLink href='#'>목표</CNavLink></CNavItem>
                            <CNavItem><CNavLink href='#'>평가</CNavLink></CNavItem>
                            <CNavItem><CNavLink href='#'>급여</CNavLink></CNavItem>
                        </CNav>
                    </CCardBody>
                </CCard>

                {/* 상세 정보 영역 */}
                <CCard className="mb-4 shadow-sm">
                    <CCardBody>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0 fw-bold">기본 정보</h5>
                            <CButton color="link" className="text-decoration-none text-muted p-0">
                                <CIcon icon={cilPencil} size="sm" /> 변경
                            </CButton>
                        </div>

                        {/* 정보 리스트 (이미지 레이아웃 참고) */}
                        <CRow className="mb-3 py-2 border-bottom border-light">
                            <CCol sm={3} className="text-muted small">이름</CCol>
                            <CCol sm={9}>
                                <span className="me-4 text-muted small">본명</span> <span className="fw-medium">{userInfo?.name}</span>
                            </CCol>
                        </CRow>

                        <CRow className="mb-3 py-2 border-bottom border-light">
                            <CCol sm={3} className="text-muted small">이메일 · 사번</CCol>
                            <CCol sm={9}>
                                <span className="me-4 text-muted small">이메일</span> <span className="fw-medium">{userInfo?.email || '정보 없음'}</span>
                                <span className="ms-5 me-4 text-muted small">사번</span> <span className="fw-medium">{userInfo?.empNo || '정보 없음'}</span>
                            </CCol>
                        </CRow>

                        <CRow className="mb-3 py-2 border-bottom border-light">
                            <CCol sm={3} className="text-muted small">입사 정보</CCol>
                            <CCol sm={9}>
                                <span className="me-4 text-muted small">입사일</span>
                                <span className="fw-medium">{userInfo?.hireDate || '정보 없음'}</span>
                                {userInfo?.hireDate && (
                                    <CBadge color="success" className="ms-3 border border-success px-2 py-1"shape="rounded-pill" style={{ fontSize: '0.7rem' }}>
                                        재직 중
                                    </CBadge>
                                )}
                            </CCol>
                        </CRow>

                        <CRow className="mb-3 py-2">
                            <CCol sm={3} className="text-muted small">휴대전화번호</CCol>
                            <CCol sm={9} className="fw-medium">{userInfo?.phone || '정보 없음'}</CCol>
                        </CRow>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default MyPage;