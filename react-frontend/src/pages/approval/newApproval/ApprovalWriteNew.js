import React from 'react';

// CoreUI 
import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react';

// 페이지 이동
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

// 시연용 이미지 파일
import refImageAbsence from 'src/assets/images/first_demo/approval_write_edit_absence_schedule_request.png'; // 부재 일정 서식
import refImageExpense from 'src/assets/images/first_demo/approval_write_edit_expense_report_add_item.png'; // 지출결의서 서식
import refImage from 'src/assets/images/first_demo/approval_write_edit_work_plan_request.png'; // 근무 계획 서식


// 1차 시연용으로 화면과 sql 쿼리를 함께 보여주기 위한 스타일 구현
import { containerStyle, stepCardStyle } from 'src/styles/js/demoPageStyle';

// 코드 하이라이터 : sql 코드 보여주는 용
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; 
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { PATH } from 'src/constants/path';

// [전자결재] 새 결재 진행 - 결재 내용 작성 페이지
const ApprovalWriteNew = () => {

    //DefaultLayout.js의 Outlet에서 보낸 userInfo 데이터 받기
    const [userInfo] = useOutletContext();

    //해당 화면의 SQL 쿼리 작성(백틱 `` 사용)
    const sqlQuery = `
        INSERT INTO APPROVAL (
            form_id,
            title,
            content,
            writer_id,
            current_step,
            max_step,
            current_approver_id,
            status,
            created_at,
            updated_at
        )
        VALUES (
            #{form_id},
            #{title},
            CAST(#{content} AS JSONB),
            #{writer_id},
            1,
            #{max_step},
            #{first_approver_id},
            '진행',
            NOW(),
            NOW()
        )
        RETURNING approval_id;
    `;

    return (
        <div style={containerStyle}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                <h2>새로운 결재 문서 작성</h2>
            </header>

            <hr style={{ border: '0', height: '1px', background: '#eee', margin: '40px 0' }} />

            {/* 1차 시연용 영역 */}
            <CCard className="mb-4" style={{ height: 'calc(100vh - 120px)' }}>
                <CCardHeader>
                    <strong>시연 화면 및 관련 SQL쿼리</strong>
                </CCardHeader>
                <CCardBody className="p-0 d-flex flex-column">
                    <div className="p-2 d-flex justify-content-end">
                        {/* 시연용 화면 이동 버튼 */}
                        {/* path에서 경로 상수 불러오기 */}
                        {/* <Link to="/approval/new/set-line"> */}
                        <Link to={PATH.APPROVAL.NEW_SETLINE}>
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                                >
                                결재선 설정
                            </CButton>
                        </Link>
                    </div>

                    {/* 레퍼런스 이미지 영역 */}
                    <div className="text-center" style={{ backgroundColor: '#f4f4f4', borderTop: '1px solid #eee' }}>
                        <img 
                            src={refImage} 
                            alt="결재 문서 작성" 
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

export default ApprovalWriteNew;