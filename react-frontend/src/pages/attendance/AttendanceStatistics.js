import React from 'react';

// 페이지 링크 이동
// import { Link } from 'react-router-dom';

// 시연용 이미지 파일
import demo_image from '../../assets/images/first_demo/근태관리_근태통계.png';

// 코드 하이라이터
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; 
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// 근태 대시보드 화면
const AttendanceStatistics = () => {

    // 핵심 SQL 
    const sql = `
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
        <div>

            {/* 버튼 클릭하여 페이지 이동 */}
            {/* <Link to="">
                <button> 근태통계 </button>
            </Link> */}

            {/* 화면 설계 이미지 */}
            <img src={demo_image} alt="attendance"/>
            <br />
            

            {/* 핵심 SQL */}
            <SyntaxHighlighter language='sql' style={atomDark}>
                {sql}
            </SyntaxHighlighter>
        </div>
    );
};

export default AttendanceStatistics;