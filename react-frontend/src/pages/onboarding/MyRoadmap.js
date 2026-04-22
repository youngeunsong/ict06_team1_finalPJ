import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react';
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import refImage from 'src/assets/images/first_demo/[Onboarding]Roadmap.png'

function MyRoadmap() {
    const navigate = useNavigate();
    const handleButtonClick = () => {
        navigate('/evaluation/quiz')
    }
    //DefaultLayout.js의 Outlet에서 보낸 userInfo 데이터 받기
    const [userInfo] = useOutletContext();

  //임시 데이터 (나중에 DB에서 가져올 부분)
  const steps = [
    { id: 1, title: '기초 직무 교육', status: 'completed' },
    { id: 2, title: '팀 프로젝트 1', status: 'current' },
    { id: 3, title: '실무 온보딩', status: 'upcoming' },
    { id: 4, title: '최종 평가', status: 'upcoming' },
  ];

    //해당 화면의 SQL 쿼리 작성(백틱 `` 사용)
    const sqlQuery = `
        -- 사용자별 로드맵 진행률 실시간 계산
        SELECT 
            r.roadmap_id,
            r.title,
            AVG(rp.rate) as overall_progress
        FROM roadmap r
        JOIN road_prog rp ON r.roadmap_id = rp.roadmap_id
        WHERE rp.emp_id = #{empId}
        GROUP BY r.roadmap_id, r.title;

        -- 아직 완료하지 않은 체크리스트 항목 조회
        SELECT
            emp_id, 
            task_name, 
            due_date
        FROM onboarding_check
        WHERE is_completed = 'N' 
        AND is_deleted = 'N'
        AND due_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '2 days')
        ORDER BY due_date ASC;
    `;

    const containerStyle = { padding: '40px', maxWidth: '1600px', margin: '0 auto', fontFamily: 'sans-serif' };
    const stepCardStyle = (status) => ({
    padding: '20px',
    marginBottom: '15px',
    borderRadius: '10px',
    borderLeft: `8px solid ${status === 'completed' ? '#27ae60' : status === 'current' ? '#1877f2' : '#ddd'}`,
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
    });

    return (
        <div style={containerStyle}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                <h2>🚀 {userInfo?.name}님의 성장 로드맵</h2>
                <button onClick={() => navigate('/welcome')} style={{ border: 'none', background: 'none', color: '#666', cursor: 'pointer' }}>뒤로가기</button>
            </header>

            {/* 로드맵 리스트 영역 */}
            <div className="roadmap-list">
                {steps.map((step) => (
                <div key={step.id} style={stepCardStyle(step.status)}>
                    <div>
                    <span style={{ fontSize: '12px', color: '#888' }}>STEP 0{step.id}</span>
                    <h3 style={{ margin: '5px 0' }}>{step.title}</h3>
                    </div>
                    <span style={{ 
                    fontWeight: 'bold', 
                    color: step.status === 'completed' ? '#27ae60' : step.status === 'current' ? '#1877f2' : '#aaa' 
                    }}>
                    {step.status === 'completed' ? '완료' : step.status === 'current' ? '진행 중' : '대기'}
                    </span>
                </div>
                ))}
            </div>

            <hr style={{ border: '0', height: '1px', background: '#eee', margin: '40px 0' }} />

            {/* 레퍼런스 이미지 영역 */}
            <CCard className="mb-4" style={{ height: 'calc(100vh - 120px)' }}>
                <CCardHeader>
                    <strong>시연 화면 및 관련 SQL쿼리</strong>
                </CCardHeader>
                <CCardBody className="p-0 d-flex flex-column">
                    {/* 시연용 화면 이동 버튼 */}
                    <div className="p-2 d-flex justify-content-end">
                        <CButton
                            color='primary'
                            variant='outline'
                            onClick={handleButtonClick}
                            style={{ fontWeight: 'bold' }}
                            >
                            퀴즈 풀기
                        </CButton>
                    </div>

                    {/* 레퍼런스 이미지 영역 */}
                    <div className="text-center" style={{ backgroundColor: '#f4f4f4', borderTop: '1px solid #eee' }}>
                        <img 
                            src={refImage} 
                            alt="로드맵 및 체크리스트" 
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
 }

export default MyRoadmap;