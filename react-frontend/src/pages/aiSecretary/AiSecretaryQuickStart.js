import React from 'react';

// CoreUI 
import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react';

// 페이지 이동
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

// 시연용 이미지 파일
import refImage from 'src/assets/images/first_demo/[AI_Secretary]answer_in_provided_format.png'

// 1차 시연용으로 화면과 sql 쿼리를 함께 보여주기 위한 스타일 구현
import { containerStyle, stepCardStyle } from 'src/styles/js/demoPageStyle';

// 코드 하이라이터 : sql 코드 보여주는 용
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; 
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

// [AI비서] 빠른 시작 결과
const AiSecretaryQuickStart = () => {

    //DefaultLayout.js의 Outlet에서 보낸 userInfo 데이터 받기
    const [userInfo] = useOutletContext();

    //해당 화면의 SQL 쿼리 작성(백틱 `` 사용)
    const sqlQuery = `
        -- [문서 작성] 보고서 초안 및 결재 사유 저장
        INSERT INTO ai_log (emp_id, type, query, response, success)
        VALUES (#{empId}, #{genType}, #{prompt}, #{resultContent}, 'Y')
        RETURNING log_id;

        -- [요약] 회의록 요약 및 액션 아이템 추출 저장
        INSERT INTO ext_cache (cache_key, cache_data, updated_at)
        VALUES (
            'SUMMARY_DOC_' || #{docId}, 
            jsonb_build_object('summary', #{summaryText}, 'action_items', #{actionItemsJson}::jsonb),
            CURRENT_TIMESTAMP
            );

        --[보안 제어] 참조 문서 권한 검증(RAG 전처리)
        SELECT doc_id FROM document 
        WHERE doc_id = ANY(#{requestedDocIds}::int[])
        AND (
            access_lvl = 'COMMON' 
            OR dept_id = #{userDeptId} 
            OR writer_id = #{empId} 
        );
    `;

    return (
        <div style={containerStyle}>

            {/* 1차 시연용 영역 */}
            <CCard className="mb-4" style={{ height: 'calc(100vh - 120px)' }}>
                <CCardHeader>
                    <strong>시연 화면 및 관련 SQL쿼리</strong>
                </CCardHeader>
                <CCardBody className="p-0 d-flex flex-column">

                    {/* 레퍼런스 이미지 영역 */}
                    <div className="text-center" style={{ backgroundColor: '#f4f4f4', borderTop: '1px solid #eee' }}>
                        <img 
                            src={refImage} 
                            alt="빠른 시작에 대한 응답" 
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

export default AiSecretaryQuickStart;