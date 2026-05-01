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
 * @ 2026.04.23    김다솜        내 정보 조회/수정 구현
*/

import { CAvatar, CBadge, CButton, CCard, CCardBody, CCol, CFormInput, CNav, CNavItem, CNavLink, CRow } from '@coreui/react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import CIcon from '@coreui/icons-react';
import { cilCheckAlt, cilPencil, cilX } from '@coreui/icons';
import { useUser } from 'src/api/UserContext';

const MyPage = () => {
    const { userInfo, updateUserInfo } = useUser();
    const [isEditing, setIsEditing] = useState(false);

    //수정 가능한 상태값 관리
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (userInfo) {
            setFormData({
                name: userInfo.name || '',
                email: userInfo.email || '',
                phone: userInfo.phone || '',
            });
        }
    }, [userInfo]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleUpdate = async() => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:8081/api/user/update', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if(response.status === 200) {
                updateUserInfo(formData);
                setIsEditing(false);
                alert('정보가 수정되었습니다.');
            }
        } catch(error) {
            console.error('수정 실패: ', error);
            alert('정보 수정 중 오류 발생');
        }
    };

    if(!userInfo)
        return <div className='p-4 text-center'>Loading...</div>

    const labelStyle = 'text-secondary small fw-semibold';
    const valueStyle = 'fw-semibold text-dark';
    const rowClass = 'mb-3 py-3 border-bottom border-light align-items-center';

    return (
        <CRow>
            <CCol xs={12}>
                {/* 상단 프로필 헤더 영역 */}
                <CCard className='mb-4 border-0 shadow-sm'>
                    <div style={{
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
                                <h4 className='mb-0 fw-bold text-dark'>
                                    {userInfo?.name || '사용자'}
                                </h4>

                                <div className='text-secondary small fw-semibold'>
                                    {userInfo?.department?.deptName || userInfo?.dept_name || '부서 없음'} · 
                                    {userInfo?.position?.positionName || userInfo?.position_name || '직급 없음'}
                                </div>

                                <div className='text-muted small mt-1'>
                                    {userInfo?.email || '-'} · {userInfo?.empNo || '-'}
                                </div>
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
                            <h5 className="mb-0 fw-bold text-dark">기본 정보</h5>
                            <div>
                                {isEditing ? (
                                    <>
                                        <CButton color="success" variant="outline" size="sm" className='me-2' onClick={handleUpdate}>
                                            <CIcon icon={cilCheckAlt} />저장
                                        </CButton>
                                        <CButton color="secondary" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                            <CIcon icon={cilX} />취소
                                        </CButton>
                                    </>
                                ) : (
                                    <CButton color='link' className='text-decoration-none text-muted p-0' onClick={() => setIsEditing(true)}>
                                        <CIcon icon={cilPencil} size='sm' />변경
                                    </CButton>
                                )}
                            </div>
                        </div>

                        {/* 사원 정보 리스트 */}
                        <CRow className={rowClass}>
                            <CCol sm={3} className={labelStyle}>이름</CCol>
                            <CCol sm={9}>
                                {isEditing ? (
                                    <CFormInput name='name' value={formData.name} onChange={handleChange} size='sm' className='w-50' />
                                ) : (
                                    <span className={valueStyle}>{userInfo?.name || '정보 없음'}</span>
                                )}
                            </CCol>
                        </CRow>

                        <CRow className={rowClass}>
                            <CCol sm={3} className={labelStyle}>이메일 · 사번</CCol>
                            <CCol sm={9}>
                                <div className="d-flex align-items-center">
                                    {isEditing ? (
                                        <CFormInput
                                            name='email'
                                            value={formData.email}
                                            onChange={handleChange} size="sm" className="w-50"
                                        />
                                    ) : (
                                        <span className={valueStyle}>{userInfo?.email || '정보 없음'}</span>
                                    )}
                                    
                                    <span className='ms-5 me-3 text-muted small'>사번</span>
                                    <span className={valueStyle}>{userInfo?.empNo || '-'}</span>
                                </div>
                            </CCol>
                        </CRow>

                        <CRow className={rowClass}>
                            <CCol sm={3} className={labelStyle}>입사 정보</CCol>
                            <CCol sm={9}>
                                <span className={valueStyle}>{userInfo?.hireDate || '정보 없음'}</span>

                                {userInfo?.hireDate && (
                                    <CBadge
                                        color="success"
                                        className="ms-3 px-2 py-1"
                                        shape="rounded-pill"
                                        style={{ fontSize: '0.7rem' }}
                                    >
                                        재직중
                                    </CBadge>
                                )}
                            </CCol>
                        </CRow>

                        <CRow className={rowClass}>
                            <CCol sm={3} className={labelStyle}>소속 정보</CCol>
                            <CCol sm={9}>
                                <span className="me-4 text-muted small">부서</span>
                                <span className={valueStyle}>
                                {userInfo?.department?.deptName || userInfo?.dept_name || '정보 없음'}
                                </span>

                                <span className="ms-5 me-4 text-muted small">직급</span>
                                <span className={valueStyle}>
                                {userInfo?.position?.positionName || userInfo?.position_name || '정보 없음'}
                                </span>
                            </CCol>
                            </CRow>

                            <CRow className={rowClass}>
                            <CCol sm={3} className={labelStyle}>계정 권한</CCol>
                            <CCol sm={9}>
                                <CBadge color="info" shape="rounded-pill">
                                {userInfo?.role?.roleName || userInfo?.role || 'USER'}
                                </CBadge>
                            </CCol>
                            </CRow>

                            <CRow className={rowClass}>
                            <CCol sm={3} className={labelStyle}>급여 등급</CCol>
                            <CCol sm={9}>
                                <span className={valueStyle}>
                                {userInfo?.grade?.gradeName || userInfo?.grade_id || '정보 없음'}
                                </span>
                            </CCol>
                            </CRow>

                            <CRow className={rowClass}>
                            <CCol sm={3} className={labelStyle}>계좌 정보</CCol>
                            <CCol sm={9}>
                                <div className='d-flex align-items-center gap-4'>
                                    <div>
                                        <span className="me-4 text-muted small">은행</span>
                                        <span className={valueStyle}>{userInfo?.bank || '-'}</span>
                                    </div>

                                    <div>
                                        <span className="me-2 text-muted small">계좌</span>
                                        <span className={valueStyle}>{userInfo?.accountNo || userInfo?.account_no || '-'}</span>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>

                        <CRow className={rowClass}>
                            <CCol sm={3} className={labelStyle}>휴대전화번호</CCol>
                            <CCol sm={9}>
                                {isEditing ? (
                                    <CFormInput name='phone' value={formData.phone} onChange={handleChange} size='sm' className="w-50" placeholder="010-0000-0000" />
                                ) : (
                                    <span className={valueStyle}>{userInfo?.phone || '정보 없음'}</span>
                                )}
                            </CCol>
                        </CRow>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default MyPage;