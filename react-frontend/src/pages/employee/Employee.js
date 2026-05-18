import React, { useState } from 'react';

// CoreUI
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow
} from '@coreui/react';

// 조직도 컴포넌트
import OrganizationTree from './OrganizationTree';
import OrganizationEmployeeList from './OrganizationEmployeeList';
import EmployeeProfileCard from './EmployeeProfileCard';

/*
 * [사용자] 인사관리 메인 페이지
 *
 * 역할:
 * - 조직도 화면 레이아웃 구성
 * - 선택한 부서 상태 관리
 * - 선택한 사원 상태 관리
 */
const Employee = () => {

    /*
     * 현재 선택한 부서 정보
     */
    const [selectedDepartment, setSelectedDepartment] = useState({
        deptId: null,
        deptName: '',
    });

    /*
     * 현재 선택한 사원 정보
     */
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    return (
        <div className="container-fluid">

            {/* 페이지 제목 */}
            <div className="mb-4">
                <h2 className="fw-bold">내 정보 및 조직도</h2>

                <div className="text-medium-emphasis">
                    조직도 및 구성원 정보를 조회할 수 있습니다.
                </div>
            </div>

            {/* 전체 레이아웃 */}
            <CRow>

                {/* ============================= */}
                {/* 왼쪽 조직도 영역 */}
                {/* ============================= */}
                <CCol lg={3}>

                    <CCard className="shadow-sm border-0 h-100">

                        <CCardHeader className="fw-bold">
                            조직도
                        </CCardHeader>

                        <CCardBody
                            style={{
                                height: '75vh',
                                overflowY: 'auto',
                            }}
                        >

                            {/* 조직도 트리 */}
                            <OrganizationTree
                                selectedDepartment={selectedDepartment}
                                setSelectedDepartment={setSelectedDepartment}
                                setSelectedEmployee={setSelectedEmployee}
                            />

                        </CCardBody>

                    </CCard>

                </CCol>

                {/* ============================= */}
                {/* 오른쪽 영역 */}
                {/* ============================= */}
                <CCol lg={9}>

                    <CRow>

                        {/* ============================= */}
                        {/* 사원 목록 영역 */}
                        {/* ============================= */}
                        <CCol lg={12} className="mb-3">

                            <CCard className="shadow-sm border-0">

                                <CCardHeader className="fw-bold">

                                    {
                                        selectedDepartment?.deptName
                                            ? `${selectedDepartment.deptName} 구성원`
                                            : '구성원 목록'
                                    }

                                </CCardHeader>

                                <CCardBody
                                    style={{
                                        height: '45vh',
                                        overflowY: 'auto',
                                    }}
                                >

                                    <OrganizationEmployeeList
                                        selectedDepartment={selectedDepartment}
                                        setSelectedEmployee={setSelectedEmployee}
                                    />

                                </CCardBody>

                            </CCard>

                        </CCol>

                        {/* ============================= */}
                        {/* 사원 상세 카드 영역 */}
                        {/* ============================= */}
                        <CCol lg={12}>

                            <CCard className="shadow-sm border-0">

                                <CCardHeader className="fw-bold">
                                    구성원 상세 정보
                                </CCardHeader>

                                <CCardBody>

                                    <EmployeeProfileCard
                                        selectedEmployee={selectedEmployee}
                                    />

                                </CCardBody>

                            </CCard>

                        </CCol>

                    </CRow>

                </CCol>

            </CRow>

        </div>
    );
};

export default Employee;