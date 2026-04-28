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

import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner } from '@coreui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import refImage from 'src/assets/images/first_demo/[Onboarding]Roadmap.png'
import { PATH } from 'src/constants/path';
import { containerStyle, stepCardStyle } from 'src/styles/js/demoPageStyle';

function MyRoadmap({ userInfo }) {
    const navigate = useNavigate();
    const [aiSteps, setAiSteps] = useState([]);
    const [loading, setLoading] = useState(true);

    //컴포넌트 로드 시 AI 서버에서 데이터 가져오기
    useEffect(() => {
        console.log("로그인 유저 정보: ", userInfo);
        const getAiRoadmap = async() => {
            if(!userInfo || !userInfo.empNo) {
                console.log("아직 사원 정보가 로딩되지 않았습니다.");
                return;
            }

            try {
                setLoading(true);
                const empNo = userInfo?.empNo;
                console.log("요청 보내는 주소:", `${PATH.AI_API.BASE}${PATH.AI_API.ROADMAP(empNo)}`);
                const url = `${PATH.AI_API.BASE}${PATH.AI_API.ROADMAP(empNo)}`;
                const response = await axios.get(url);
                console.log("AI 서버 응답 데이터:", response.data);

                if(response.data.error || !response.data.recommended_roadmap) {
                    setAiSteps([{
                        id: 1,
                        title: "로드맵 생성 실패(API 키 또는 네트워크 확인)",
                        status: 'current'
                    }]);
                }
                
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

            {/* 로드맵 리스트 영역 - 타임라인 스타일 */}
            <div className="roadmap-container" style={{ padding: '20px 0' }}>
            {loading ? (
                <div className="text-center py-5">
                <CSpinner color="primary" />
                <p className="mt-3" style={{ color: '#666' }}>다솜님의 커리어 데이터를 분석하여 맞춤형 로드맵을 생성 중입니다...</p>
                </div>
            ) : (
                aiSteps.map((step, index) => (
                <CRow key={step.id} className="mb-4 align-items-center">
                    {/* 왼쪽: STEP 표시 */}
                    <CCol xs={2} md={1} className="text-center">
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        backgroundColor: step.status === 'current' ? '#321fdb' : '#ebedef',
                        color: step.status === 'current' ? 'white' : '#4f5d73',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        margin: '0 auto'
                    }}>
                        {index + 1}
                    </div>
                    {index !== aiSteps.length - 1 && (
                        <div style={{ width: '2px', height: '40px', backgroundColor: '#ebedef', margin: '10px auto' }}></div>
                    )}
                    </CCol>

                    {/* 오른쪽: 상세 카드 */}
                    <CCol xs={10} md={11}>
                    <CCard style={{ 
                        borderLeft: step.status === 'current' ? '5px solid #321fdb' : '1px solid #ebedef',
                        boxShadow: step.status === 'current' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                    }}>
                        <CCardBody className="d-flex justify-content-between align-items-center">
                        <div>
                            <small className="text-muted">STEP 0{step.id}</small>
                            <h5 className="mb-0" style={{ fontWeight: 'bold' }}>{step.title}</h5>
                        </div>
                        <div className="text-end">
                            <CBadge 
                            color={step.status === 'current' ? 'primary' : 'light'} 
                            shape="rounded-pill"
                            style={{ padding: '8px 12px' }}
                            >
                            {step.status === 'current' ? '추천 학습' : '예정'}
                            </CBadge>
                            {step.status === 'current' && (
                            <CButton 
                                size="sm" 
                                color="link" 
                                onClick={() => navigate(PATH.ONBOARDING.QUIZ)}
                                style={{ display: 'block', marginTop: '5px', fontSize: '12px' }}
                            >
                                관련 퀴즈 풀기 →
                            </CButton>
                            )}
                        </div>
                        </CCardBody>
                    </CCard>
                    </CCol>
                </CRow>
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