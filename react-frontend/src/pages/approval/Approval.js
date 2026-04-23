import React from 'react';

// CoreUI 
import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react';

// 페이지 이동
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

// 시연용 이미지 파일
import refImage from 'src/assets/images/first_demo/e_approval_main.png'

// 1차 시연용으로 화면과 sql 쿼리를 함께 보여주기 위한 스타일 구현
import { containerStyle, stepCardStyle } from 'src/styles/js/demoPageStyle';

// 코드 하이라이터 : sql 코드 보여주는 용
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; 
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { PATH } from 'src/constants/path';

// [전자결재] 전자결재 메인 페이지
const Approval = () => {
    //DefaultLayout.js의 Outlet에서 보낸 userInfo 데이터 받기
    const [userInfo] = useOutletContext();

    //해당 화면의 SQL 쿼리 작성(백틱 `` 사용)
    const sqlQuery = `
        SELECT 
            a.approval_id,
            a.title,
            a.writer_id,
            a.current_step,
            a.created_at
        FROM APPROVAL a
        WHERE a.current_approver_id = #{emp_id}
        AND a.status = '진행'
        ORDER BY a.created_at ASC
        LIMIT 3;

        SELECT 
            a.approval_id,
            a.title,
            a.current_step,
            a.max_step,
            a.status,
            a.created_at
        FROM APPROVAL a
        WHERE a.writer_id = #{emp_id}
        AND a.status IN ('대기', '진행')
        ORDER BY a.created_at DESC
        LIMIT 3;
    `;

    return (
        <div style={containerStyle}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                <h2>🚀 {userInfo?.name}님의 전자결재 현황</h2>
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
                        {/* <Link to="/approval/new/select-form"> */}
                        <Link to={PATH.APPROVAL.NEW_SELECT}>
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                                >
                                새 결재 작성
                            </CButton>
                        </Link>

                        {/* <Link to="/approval/tmpApprovals"> */}
                        <Link to={PATH.APPROVAL.TMP}>
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                                >
                                임시저장함
                            </CButton>
                        </Link>

                        {/* <Link to="/approval/personalApprovals"> */}
                        <Link to={PATH.APPROVAL.PERSONAL}>
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                                >
                                개인문서함
                            </CButton>
                        </Link>

                        {/* [팀장 전용 메뉴 시작] --- (추후 팀장에게만 보이게 처리) */}
                        {/* <Link to="/approval/pendingApprovals"> */}
                        <Link to={PATH.APPROVAL.PENDING}>
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                                >
                                결재 대기 문서함
                            </CButton>
                        </Link>

                        {/* <Link to="/approval/upcomingApprovals"> */}
                        <Link to={PATH.APPROVAL.UPCOMING}>
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                                >
                                결재 예정 문서함
                            </CButton>
                        </Link>

                        {/* [팀장 전용 메뉴 끝] --- (추후 팀장에게만 보이게 처리) */}
                    </div>

                    {/* 레퍼런스 이미지 영역 */}
                    <div className="text-center" style={{ backgroundColor: '#f4f4f4', borderTop: '1px solid #eee' }}>
                        <img 
                            src={refImage} 
                            alt="전자결재 메인" 
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

export default Approval;