/**
 * @FileName : MyRoadmap.js
 * @Description : 인사평가 > AI 온보딩 로드맵
 * @Author : 김다솜
 * @Date : 2026. 04. 21
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.21    김다솜        최초 생성/화면 구성
 */

import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

import refImage from 'src/assets/images/first_demo/[Onboarding]Roadmap.png'
import { PATH } from 'src/constants/path';
import { containerStyle, stepCardStyle } from 'src/styles/js/demoPageStyle';

function MyRoadmap({ userInfo }) {
    const navigate = useNavigate();
    const [aiSteps, setAiSteps] = useState([]);
    const [loading, setLoading] = useState(true);

    //컴포넌트 로드 시 AI 서버에서 데이터 가져오기
    useEffect(() => {
        const getAiRoadmap = async() => {
            try {
                const empNo = userInfo?.emp_no;
                const response = await axios.get(`http://localhost:8000/api/ai/roadmap/${empNo}`);
                
                //받아온 추천 리스트 변환
                const formattedSteps = response.data.recommended_roadmap.map((title, index) => ({
                    id: index + 1,
                    title: title,
                    status: index === 0 ? 'current' : 'upcoming'
                }));
                setAiSteps(formattedSteps);
            } catch(err) {
                console.error("AI 로드맵 로딩 실패: ", err);
            } finally {
                setLoading(false);
            }
        };
        getAiRoadmap();
    }, [userInfo]);

    const handleButtonClick = () => {
        // navigate('/evaluation/quiz')
        navigate(PATH.ONBOARDING.QUIZ); 
    }

    return (
        <div style={containerStyle}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                <h2>🚀 {userInfo?.name}님의 성장 로드맵</h2>
                <button onClick={() => navigate('/welcome')} style={{ border: 'none', background: 'none', color: '#666', cursor: 'pointer' }}>뒤로가기</button>
            </header>

            {/* 로드맵 리스트 영역 */}
            <div className="roadmap-list">
                {loading ? (
                    <div className="text-center"><CSpinner color="primary" /> AI가 최적의 로드맵을 분석 중입니다...</div>
                ) : (
                    aiSteps.map((step) => (
                        <div key={step.id} style={stepCardStyle(step.status)}>
                            <div>
                                <span style={{ fontSize: '12px', color: '#888' }}>STEP 0{step.id}</span>
                                <h3 style={{ margin: '5px 0' }}>{step.title}</h3>
                            </div>
                            <span style={{ 
                                fontWeight: 'bold', 
                                color: step.status === 'completed' ? '#27ae60' : step.status === 'current' ? '#1877f2' : '#aaa' 
                            }}>
                                {step.status === 'completed' ? '완료' : step.status === 'current' ? '진행 중' : '추천'}
                            </span>
                        </div>
                    ))
                )}
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
                </CCardBody>
            </CCard>
        </div>
    );
 }

export default MyRoadmap;