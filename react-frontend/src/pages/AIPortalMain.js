import React from 'react';

// CoreUI 
import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react';

// 페이지 이동
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

// 1차 시연용으로 화면과 sql 쿼리를 함께 보여주기 위한 스타일 구현
import { containerStyle, stepCardStyle } from 'src/styles/js/demoPageStyle';

// 코드 하이라이터 : sql 코드 보여주는 용
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; 
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

// [AI 비서, AI 챗봇] 사내 AI 포털 페이지
const AIPortalMain = () => {

    //DefaultLayout.js의 Outlet에서 보낸 userInfo 데이터 받기
    const [userInfo] = useOutletContext();

    //해당 화면의 SQL 쿼리 작성(백틱 `` 사용)
    const sqlQuery = `
        SELECT title AS task_name, 'SCHEDULE' AS source 
        FROM schedule 
        WHERE creator_id = #{empId} AND end_time < CURRENT_TIMESTAMP
        UNION ALL
        SELECT (item->>'task')::text, 'AI_EXTRACT' AS source 
        FROM ext_cache, jsonb_array_elements(cache_data->'action_items') AS item
        WHERE cache_key LIKE 'SUMMARY_DOC_%'
        AND updated_at >= CURRENT_DATE - INTERVAL '1 day';
    `;

    return (
        <div style={containerStyle}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                <h2>사내 AI 포털</h2>
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
                        <Link to="/ai-portal/secretary">
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                                >
                                AI 비서
                            </CButton>
                        </Link>

                        <Link to="/ai-portal/chatbot">
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                                >
                                AI 챗봇
                            </CButton>
                        </Link>
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

export default AIPortalMain;