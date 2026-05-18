import React, { useEffect, useState } from 'react';

// API 호출용 axios
import axiosInstance from 'src/api/axiosInstance';

// CoreUI
import {
    CSpinner
} from '@coreui/react';

/*
 * 조직도 트리 컴포넌트
 *
 * 역할:
 * - 조직도 부서 트리 조회
 * - 본부/팀 구조 출력
 * - 본부 아코디언 처리
 * - 선택 부서 상태 변경
 */
const OrganizationTree = ({
    selectedDepartment,
    setSelectedDepartment,
    setSelectedEmployee,
}) => {

    /*
     * 조직도 트리 데이터
     */
    const [departments, setDepartments] = useState([]);

    /*
     * 로딩 상태
     */
    const [loading, setLoading] = useState(true);

    /*
     * 현재 펼쳐진 본부 ID
     */
    const [openedParentDeptId, setOpenedParentDeptId] = useState(null);

    /*
     * 컴포넌트 최초 렌더링 시
     * 조직도 트리 조회
     */
    useEffect(() => {
        fetchDepartmentTree();
    }, []);

    /*
     * 조직도 트리 API 호출
     */
    const fetchDepartmentTree = async () => {

        try {

            const response = await axiosInstance.get(
                '/organization/departments/tree'
            );

            console.log('조직도 데이터:', response.data);

            setDepartments(response.data);

        } catch (error) {

            console.error('조직도 조회 실패:', error);

        } finally {

            setLoading(false);

        }
    };

    /*
     * 본부 클릭 처리
     */
    const handleParentClick = (parentDept) => {

        // 현재 열린 본부 변경
        setOpenedParentDeptId(parentDept.deptId);

        // 현재 선택 부서 변경
        setSelectedDepartment({
            deptId: parentDept.deptId,
            deptName: parentDept.deptName,
        });

        // 선택 사원 초기화
        setSelectedEmployee(null);
    };

    /*
     * 팀 클릭 처리
     */
    const handleTeamClick = (team) => {

        setSelectedDepartment({
            deptId: team.deptId,
            deptName: team.deptName,
        });

        setSelectedEmployee(null);
    };

    /*
     * 로딩 중
     */
    if (loading) {
        return (
            <div className="text-center py-3">
                <CSpinner />
            </div>
        );
    }

    return (
        <div>

            {
                departments.map((parentDept) => (

                    <div
                        key={parentDept.deptId}
                        className="mb-3"
                    >

                        {/* ============================= */}
                        {/* 본부 영역 */}
                        {/* ============================= */}
                        <div
                            onClick={() => handleParentClick(parentDept)}
                            style={{
                                cursor: 'pointer',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                backgroundColor:
                                    selectedDepartment?.deptId === parentDept.deptId
                                        ? '#321fdb'
                                        : '#f3f4f7',
                                color:
                                    selectedDepartment?.deptId === parentDept.deptId
                                        ? '#fff'
                                        : '#333',
                                fontWeight: 'bold',
                                transition: '0.2s',
                            }}
                        >
                            {parentDept.deptName}
                        </div>

                        {/* ============================= */}
                        {/* 하위 팀 영역 */}
                        {/* ============================= */}
                        {
                            openedParentDeptId === parentDept.deptId && (
                                <div
                                    style={{
                                        marginTop: '8px',
                                        marginLeft: '10px',
                                    }}
                                >

                                    {
                                        parentDept.children
                                            ?.filter((team) => team != null)
                                            .map((team) => (

                                                <div
                                                    key={team.deptId}
                                                    onClick={() => handleTeamClick(team)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        padding: '8px 12px',
                                                        marginBottom: '6px',
                                                        borderRadius: '6px',
                                                        backgroundColor:
                                                            selectedDepartment?.deptId === team.deptId
                                                                ? '#dfe3ff'
                                                                : '#f9f9fb',
                                                        fontSize: '14px',
                                                        transition: '0.2s',
                                                    }}
                                                >
                                                    └ {team.deptName}
                                                </div>

                                            ))
                                    }

                                </div>
                            )
                        }

                    </div>

                ))
            }

        </div>
    );
};

export default OrganizationTree;