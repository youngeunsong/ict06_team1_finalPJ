import React from 'react';

// CoreUI 
import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react';

// 페이지 이동
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

// 시연용 이미지 파일
import refImage from '../../assets/images/first_demo/attendance_statistics.png';

// 1차 시연용으로 화면과 sql 쿼리를 함께 보여주기 위한 스타일 구현
import { containerStyle, stepCardStyle } from 'src/styles/js/demoPageStyle';

// 코드 하이라이터
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; 
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

// [근태관리] 근태 대시보드 페이지
const AttendanceStatistics = () => {

    //DefaultLayout.js의 Outlet에서 보낸 userInfo 데이터 받기
    const [userInfo] = useOutletContext();

    // 핵심 SQL 
    const sqlQuery = `
    -- 대시보드용 월간 통계 (부서별/개인별)
    SELECT 
        m.dept_id,
        AVG(daily_work_time) FILTER (WHERE daily_work_time > 0) as avg_hours, -- 평균 근무시간
        COUNT(*) FILTER (WHERE status = 'LATE') as late_count, -- 지각 건수
        COUNT(*) FILTER (WHERE status = 'ABSENT') as absent_count, -- 결근 건수
        TO_CHAR(check_in, 'YYYY-MM') as work_month,
        -- 연장 근무: 8시간(기본) 초과분의 합계
        SUM(CASE WHEN daily_work_time > 8 THEN daily_work_time - 8 ELSE 0 END) as overtime_total
    FROM attendance a
    JOIN members m ON a.user_id = m.user_id
    WHERE a.check_in >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY m.dept_id, TO_CHAR(check_in, 'YYYY-MM')
    ORDER BY work_month DESC;
    `; 

    return (
        <div style={containerStyle}>

            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                <h2>{userInfo?.name}님의 근태 통계</h2>
            </header>

            <hr style={{ border: '0', height: '1px', background: '#eee', margin: '40px 0' }} />

            {/* 1차 시연용 영역 */}
            <CCard className="mb-4" style={{ height: 'calc(100vh - 120px)' }}>
                <CCardHeader>
                    <strong>시연 화면 및 관련 SQL쿼리</strong>
                </CCardHeader>
                <CCardBody className="p-0 d-flex flex-column">
                    <div className="p-2 d-flex justify-content-end">
                        {/* 방법2 */}
                        <Link to="/attendance/holidays">
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                                >
                                연차현황
                            </CButton>
                        </Link>
                    </div>


                    {/* 레퍼런스 이미지 영역 */}
                    <div className="text-center" style={{ backgroundColor: '#f4f4f4', borderTop: '1px solid #eee' }}>
                        <img 
                            src={refImage} 
                            alt="근태통계" 
                            style={{ width: '100%',
                            height: 'auto',
                            display: 'block' }} 
                        />
                    </div>

                    {/* SQL 쿼리 영역 */}
                    <div className='text-start mt-4'>
                        <h5 className='mb-3' style={{ fontWeight: 'bold', color: '#4f5d73' }}>
                            <span style={{ borderLeft: '4px solid #321fdb', paddingLeft: '10px' }}>
                                관련 SQL 쿼리
                            </span>
                        </h5>
                        <SyntaxHighlighter language='sql' style={coy}>
                            {sqlQuery}
                        </SyntaxHighlighter>
                    </div>
                </CCardBody>
            </CCard>
        </div>
    );
};

export default AttendanceStatistics;