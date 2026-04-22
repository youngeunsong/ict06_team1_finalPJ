import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import refImage from 'src/assets/images/first_demo/[Evaluation]Evaluation3.png'

const Evaluation2 = () => {
    const navigate = useNavigate();
    const handleButtonClick = () => {
        navigate('/evaluation/quiz')
    }

    //해당 화면의 SQL 쿼리 작성(백틱 `` 사용)
    const sqlQuery = `
        -- AI 퀴즈 답변 및 유사도 기반 점수 저장
        INSERT INTO ai_log (emp_id, type, query, response, success)
        VALUES (
            #{empId}, 
            'QUIZ_EVAL', 
            #{userAnswer}, -- 질문 데이터
            jsonb_build_object('score', #{similarityScore}, 'feedback', #{aiFeedback}), -- 응답 데이터
            'Y'
        );
    `;

    const containerStyle = {
        padding: '20px',
        maxWidth: '1600px',
        margin: '0 auto',
        fontFamily: 'sans-serif'
    };

    return (
        <div style={containerStyle}>
            <CCard className="mb-4">
                <CCardHeader>
                    <strong>시연 화면 및 관련 SQL쿼리</strong>
                </CCardHeader>
                <CCardBody>
                    {/* 시연용 화면 이동 버튼 */}
                    <div className='p-3 d-flex justify-content-end mb-3'>
                        <CButton
                            color='primary'
                            variant='outline'
                            onClick={handleButtonClick}
                            style={{ fontWeight: 'bold' }}
                            >

                        </CButton>
                    </div>

                    {/* 레퍼런스 이미지 영역 */}
                    <div style={{ width: '100%', overflow: 'hidden' }}>
                        <img
                            src={refImage}
                            alt="레퍼런스 이미지"
                            style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                            }}
                        />
                    </div>

                    {/* SQL 쿼리 영역 */}
                    <div className='text-start mt-4'>
                        <h5 className='mb-3' style={{ fontWeight: 'bold', color: '#4f5d73' }}>
                            <span style={{ borderLeft: '4px solid #321fdb', paddingLeft: '10px' }}>
                                관련 SQL 쿼리
                            </span>
                        </h5>
                        <pre style={{
                            backgroundColor: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '5px',
                            border: '1px solid #ebedef',
                            color: '#2f353a',
                            fontSize: '0.9rem',
                            fontFamily: 'monospace',
                            overflowX: 'auto',
                            lineHeight: '1.5'
                        }}>
                            <code>{sqlQuery}</code>
                        </pre>
                    </div>
                </CCardBody>
            </CCard>
        </div>
    );
};

export default Evaluation2;