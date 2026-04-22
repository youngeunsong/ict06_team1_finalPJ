import React, { useState } from 'react';
// 페이지 링크 이동
import { Link, useNavigate, useOutletContext  } from 'react-router-dom';

// CoreUI 
import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react';

// 시연용 이미지 파일
import demo_image from '../../assets/images/first_demo/attendance_monthly_view.png';
import demo_image_weekly from '../../assets/images/first_demo/attendance_weekly_view.png';

// 1차 시연용으로 화면과 sql 쿼리를 함께 보여주기 위한 스타일 구현
import { containerStyle, stepCardStyle } from 'src/styles/js/demoPageStyle';

// 코드 하이라이터 : sql 코드 보여주는 용
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; 
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

// [근태관리] 근태관리 홈 화면
const AttendanceManagement = () => {

    //DefaultLayout.js의 Outlet에서 보낸 userInfo 데이터 받기
    const [userInfo] = useOutletContext();

    // 핵심 SQL 
    const sql = `
    -- 출근 등록: 사용자의 설정 시간과 비교하여 지각 여부 자동 입력
    INSERT INTO attendance (user_id, check_in, ip_address, status)
    VALUES (
        #{userId}, 
        CURRENT_TIMESTAMP, 
        #{ipAddress},
        CASE 
            WHEN CURRENT_TIME > (SELECT start_time FROM work_types WHERE type_id = #{typeId}) THEN 'LATE'
            ELSE 'NORMAL'
        END
    )
    RETURNING att_id;

    -- 퇴근 등록 및 총 근무 시간(초단위) 계산 후 업데이트
    UPDATE attendance 
    SET 
        check_out = CURRENT_TIMESTAMP,
        daily_work_time = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - check_in)) / 3600, -- 시간 단위 계산
        status = CASE 
                    WHEN status = 'LATE' THEN 'LATE' -- 지각은 유지
                    WHEN CURRENT_TIME < '18:00:00'::TIME THEN 'EARLY_LEAVE' -- 조퇴 판단
                    ELSE 'NORMAL'
                END
    WHERE user_id = #{userId} AND check_out IS NULL;
    `; 

    // 1차 시연용 css 

    // 1. 이미지 경로를 상태로 관리
    const [imgSrc, setImgSrc] = useState(demo_image); 

    const changeImage = () => {
        // 2. 버튼 클릭 시 다른 이미지로 변경
        setImgSrc(imgSrc === demo_image ? demo_image_weekly : demo_image);
    }

    return (
        <div style={containerStyle}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                <h2>🚀 {userInfo?.name}님의 근태 현황</h2>
            </header>    


            {/* 1차 시연용 영역 */}
            <CCard className="mb-4" style={{ height: 'calc(100vh - 120px)' }}>
                <CCardHeader>
                    <strong>시연 화면 및 관련 SQL쿼리</strong>
                </CCardHeader>
                <CCardBody className="p-0 d-flex flex-column">

                    <div className="p-2 d-flex justify-content-between">
                        {/* 버튼 클릭하여 뷰 전환 */}
                        <CButton
                            color='primary'
                            variant='outline'
                            style={{ fontWeight: 'bold' }}
                            onClick={changeImage}
                            >
                            월간/주별 보기
                        </CButton>
                    
                        {/* 버튼 클릭하여 페이지 이동 */}
                        <Link to="/attendance/stats">
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                                >
                                근태통계
                            </CButton>
                        </Link>
                    </div>

                    {/* 레퍼런스 이미지 영역 */}
                    <div className="text-center" style={{ backgroundColor: '#f4f4f4', borderTop: '1px solid #eee' }}>
                        <img 
                            src={imgSrc} 
                            alt="근태 현황 보기" 
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
                            {sql}
                        </SyntaxHighlighter>
                    </div>
                </CCardBody>
            </CCard>    
        </div>
    );
};

export default AttendanceManagement;