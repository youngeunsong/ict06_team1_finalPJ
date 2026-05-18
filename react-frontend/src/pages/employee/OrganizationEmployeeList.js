import React, { useEffect, useMemo, useState } from 'react';

// API 호출용 axios
import axiosInstance from 'src/api/axiosInstance';

// CoreUI
import {
    CBadge,
    CFormInput,
    CSpinner
} from '@coreui/react';

/*
 * 조직도 사원 목록 컴포넌트
 *
 * 역할:
 * - 선택한 부서의 사원 목록 조회
 * - 사원 검색
 * - 직급/이름/상태 출력
 * - 사원 클릭 처리
 */
const OrganizationEmployeeList = ({
    selectedDepartment,
    setSelectedEmployee,
}) => {

    /*
     * 사원 목록 데이터
     */
    const [employees, setEmployees] = useState([]);

    /*
     * 검색어 상태
     */
    const [keyword, setKeyword] = useState('');

    /*
     * 로딩 상태
     */
    const [loading, setLoading] = useState(false);

    /*
     * 선택 부서 변경 시
     * 사원 목록 다시 조회
     */
    useEffect(() => {

        // 선택 부서 없으면 초기화
        if (!selectedDepartment?.deptId) {
            setEmployees([]);
            return;
        }

        fetchEmployees();

    }, [selectedDepartment]);

    /*
     * 부서별 사원 목록 조회
     */
    const fetchEmployees = async () => {

        try {

            setLoading(true);

            const response = await axiosInstance.get(
                `/organization/employees?deptId=${selectedDepartment.deptId}`
            );

            console.log('사원 목록:', response.data);

            setEmployees(response.data);

        } catch (error) {

            console.error('사원 목록 조회 실패:', error);

        } finally {

            setLoading(false);

        }
    };

    /*
     * 검색 필터링된 사원 목록
     */
    const filteredEmployees = useMemo(() => {

        // 검색어 없으면 전체 반환
        if (!keyword.trim()) {
            return employees;
        }

        const lowerKeyword = keyword.toLowerCase();

        return employees.filter((employee) => {

            return (
                employee.name?.toLowerCase().includes(lowerKeyword) ||
                employee.positionName?.toLowerCase().includes(lowerKeyword)
            );
        });

    }, [employees, keyword]);

    /*
     * 사원 클릭 처리
     */
    const handleEmployeeClick = (employee) => {

        setSelectedEmployee(employee);
    };

    /*
     * 로딩 중
     */
    if (loading) {
        return (
            <div className="text-center py-5">
                <CSpinner />
            </div>
        );
    }

    return (
        <div>

            {/* ============================= */}
            {/* 검색 영역 */}
            {/* ============================= */}
            <div className="mb-3">

                <CFormInput
                    placeholder="이름 또는 직급 검색"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />

            </div>

            {/* ============================= */}
            {/* 검색 결과 없음 */}
            {/* ============================= */}
            {
                filteredEmployees.length === 0 && (
                    <div
                        className="text-center text-medium-emphasis py-5"
                    >
                        검색 결과가 없습니다.
                    </div>
                )
            }

            {/* ============================= */}
            {/* 사원 목록 */}
            {/* ============================= */}
            {
                filteredEmployees.map((employee) => (

                    <div
                        key={employee.empNo}
                        onClick={() => handleEmployeeClick(employee)}
                        style={{
                            padding: '14px 16px',
                            borderBottom: '1px solid #f1f1f1',
                            cursor: 'pointer',
                            transition: '0.2s',
                        }}
                    >

                        {/* 상단 */}
                        <div
                            className="d-flex justify-content-between align-items-center"
                        >

                            {/* 이름 + 직급 */}
                            <div>

                                <div
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: '15px',
                                    }}
                                >
                                    {employee.name}
                                </div>

                                <div
                                    className="text-medium-emphasis"
                                    style={{
                                        fontSize: '13px',
                                    }}
                                >
                                    {employee.positionName}
                                </div>

                            </div>

                            {/* 상태 */}
                            <CBadge
                                color={
                                    employee.status === '재직'
                                        ? 'success'
                                        : employee.status === '휴직'
                                            ? 'warning'
                                            : 'secondary'
                                }
                            >
                                {employee.status}
                            </CBadge>

                        </div>

                    </div>

                ))
            }

        </div>
    );
};

export default OrganizationEmployeeList;