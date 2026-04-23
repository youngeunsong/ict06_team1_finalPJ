import React, { useState } from 'react';

// CoreUI 
import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react';

// 페이지 이동
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

// 시연용 이미지 파일
import refImage from 'src/assets/images/first_demo/calendar.png';
import refImage_list from 'src/assets/images/first_demo/calendar_listShow.png';

// 1차 시연용으로 화면과 sql 쿼리를 함께 보여주기 위한 스타일 구현
import { containerStyle, stepCardStyle } from 'src/styles/js/demoPageStyle';

// 코드 하이라이터 : sql 코드 보여주는 용
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; 
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Calendar = () => {

    //DefaultLayout.js의 Outlet에서 보낸 userInfo 데이터 받기
    const [userInfo] = useOutletContext();

    //해당 화면의 SQL 쿼리 작성(백틱 `` 사용)
    const sqlQuery = `
        INSERT INTO schedule (
            title, start_time, end_time, content, location, 
            type, category, creator_id, dept_id
        ) VALUES (
            #{title}, #{startTime}, #{endTime}, #{content}, #{location}, 
            #{type}, #{category}, #{empId}, #{deptId}
        ) RETURNING sched_id;

        UPDATE schedule 
        SET 
            is_deleted = 'Y',
            updated_at = CURRENT_TIMESTAMP
        WHERE sched_id = #{schedId} 
        AND creator_id = #{empId};
    `;

    // 1. 이미지 경로를 상태로 관리
    const [imgSrc, setImgSrc] = useState(refImage); 

    const changeImage = () => {
        // 2. 버튼 클릭 시 다른 이미지로 변경
        setImgSrc(imgSrc === refImage ? refImage_list : refImage);
    }

    return (
        <div style={containerStyle}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                <h2>🚀 {userInfo?.name}님의 캘린더</h2>
            </header>

            <hr style={{ border: '0', height: '1px', background: '#eee', margin: '40px 0' }} />

            {/* 1차 시연용 영역 */}
            <CCard className="mb-4" style={{ height: 'calc(100vh - 120px)' }}>
                <CCardHeader>
                    <strong>시연 화면 및 관련 SQL쿼리</strong>
                </CCardHeader>
                <CCardBody className="p-0 d-flex flex-column">
                    <div className="p-2 d-flex justify-content-end">
                        {/* 버튼 클릭하여 뷰 전환 */}
                        <CButton
                            color='primary'
                            variant='outline'
                            style={{ fontWeight: 'bold' }}
                            onClick={changeImage}
                            >
                            캘린더/리스트 뷰 보기
                        </CButton>

                        {/* 시연용 화면 이동 버튼 */}
                        <Link to="/calendar/simple-add">
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                                >
                                일정 간단 등록
                            </CButton>
                        </Link>

                        <Link to="/calendar/detail-add">
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                                >
                                상세 등록
                            </CButton>
                        </Link>

                        <Link to="/calendar/detail">
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                                >
                                일정 상세
                            </CButton>
                        </Link>
                    </div>

                    {/* 레퍼런스 이미지 영역 */}
                    <div className="text-center" style={{ backgroundColor: '#f4f4f4', borderTop: '1px solid #eee' }}>
                        <img 
                            src={imgSrc} 
                            alt="월간뷰" 
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

export default Calendar;