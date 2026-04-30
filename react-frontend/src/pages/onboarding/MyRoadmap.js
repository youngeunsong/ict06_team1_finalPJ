/**
 * @FileName : MyRoadmap.js
 * @Description : AI 온보딩 교육 로드맵 화면
*                - 사원별 맞춤 교육 로드맵 조회
*                - 교육 그룹별 드롭다운 목록 표시
*                - 학습 상태 배지 및 진행률 표
*                - 체크리스트 미리보기 위젯 연동
 * @Author : 김다솜
 * @Date : 2026. 04. 21
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.21    김다솜        최초 생성 및 AI 온보딩 로드맵 화면 구성
 * @ 2026.04.27    김다솜        Gemini API 연동 및 로드맵 추천 리스트 렌더링 구현
 * @ 2026.04.28    김다솜        교육 그룹별 드롭다운 UI 구조로 변경
 * @ 2026.04.29    김다솜        학습 상태 배지, 진행률 표시 및 체크리스트 미리보기 연동
 */

import { CBadge, CCard, CCardBody, CSpinner } from '@coreui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { PATH } from 'src/constants/path';
import { containerStyle } from 'src/styles/js/demoPageStyle';

import ChecklistPreview from './ChecklistPreview';
import { previewWrapper } from 'src/styles/js/onboarding/ChecklistStyle';
import { progressBoxStyle, progressTrackStyle, roadmapHeaderStyle } from 'src/styles/js/onboarding/RoadmapStyle';

function MyRoadmap({ userInfo }) {
    console.log("🔥 최종 userInfo:", userInfo);
    const navigate = useNavigate();
    const location = useLocation();
    const [roadmapGroups, setRoadmapGroups] = useState([]);
    const [openGroup, setOpenGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    //학습하기 클릭 핸들러 -> 학습 콘텐츠 상세 페이지로 이동
    //contentId: 콘텐츠 상세 조회용
    //itemId: ROAD_PROGRESS 저장용
    const handleLearningClick = (contentId, title, itemId) => {
        navigate(PATH.ONBOARDING.LEARNING(contentId), {
            state: { title, itemId, userInfo }
        });
    };

    //컴포넌트 로드 시 AI 서버에서 데이터 가져오기
    useEffect(() => {
        console.log("로그인 유저 정보: ", userInfo);

        const getAiRoadmap = async () => {
            const empNo = userInfo?.empNo;

            if (!empNo) {
                console.warn("[MyRoadmap] empNo 없음. userInfo 필드명 확인 필요: ", userInfo);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const url = `${PATH.AI_API.BASE}${PATH.AI_API.ROADMAP(empNo)}`;
                const response = await axios.get(url);

                console.log("[MyRoadmap] 응답 전체: ", response);
                console.log("[MyRoadmap] 응답 data:", response.data);
                console.log("[MyRoadmap] recommended_roadmap:", response.data?.recommended_roadmap);
                console.log("[MyRoadmap] 첫 번째 item 확인:", response.data?.recommended_roadmap?.[0]?.items?.[0]);

                if (!response.data.error && response.data.recommended_roadmap) {
                    //1. 받아온 로드맵 그룹 출력
                    setRoadmapGroups(response.data.recommended_roadmap);
                    console.log("[MyRoadmap] 로드맵 그룹: ", response.data.recommended_roadmap);
                } else {
                    console.warn("[MyRoadmap] 추천 로드맵 배열이 아님: ", response.data);
                    setRoadmapGroups([]);
                }
            } catch (err) {
                console.error("[MyRoadmap] AI 로드맵 로딩 실패: ", err);
                console.error("[MyRoadmap] error response: ", err.response);
                setRoadmapGroups([]);
            } finally {
                setLoading(false);
            }
        };
        getAiRoadmap();
    }, [userInfo]);

    useEffect(() => {
        // 학습 상세 페이지에서 완료 처리 후 돌아왔을 때
        // 전달 받은 updatedItemId에 해당하는 항목을 즉시 '완료' 상태로 변경
        const updatedItemId = location.state?.updatedItemId;

        if (!updatedItemId) return;

        setRoadmapGroups((prevGroups) =>
            prevGroups.map((group) => ({
                ...group,
                items: group.items.map((item) =>
                    Number(item.item_id || item.itemId) === Number(updatedItemId)
                        ? {
                            ...item,
                            status: 'COMPLETED',
                            rate: 100,
                        }
                        : item
                ),
            }))
        );

        //새로고침/뒤로가기 시 같은 state 반복 적용되지 않도록 정리
        navigate(location.pathname, { replace: true, state: {} });
    }, [location.state, location.pathname, navigate]);

    /**
     * 콘텐츠 학습 상태에 따라 배지 색상+텍스트 반환하는 함수
     *
     * :param {string} status - 학습 상태 (NOT_STARTED, IN_PROGRESS, COMPLETED)
     * :returns {{color: string, text: string}} - 배지 색상과 표시 텍스트
     */
    const getStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETED':
                return { color: 'success', text: '완료' };
            case 'IN_PROGRESS':
                return { color: 'warning', text: '진행중' };
            case 'NOT_STARTED':
            default:
                return { color: 'secondary', text: '미진행' };
        }
    };

    /**
     * 아이템 목록 기준 완료율 계산
     * 
     * :param {Array} items - 로드맵 아이템 목록
     * :returns {{ completed: number, total: number, percent: number }}
     */
    const calculateProgress = (items = []) => {
        const total = items.length;
        const completed = items.filter((item) => item.status === 'COMPLETED').length;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        return { completed, total, percent };
    };

    // 전체 로드맵 진행률 계산
    const calculateTotalProgress = (roadmap = []) => {
        let total = 0;
        let completed = 0;

        roadmap.forEach((group) => {
            total += group.items.length;
            completed += group.items.filter(item => item.status === 'COMPLETED').length;
        });
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        return { total, completed, percent };
    };

    const totalProgress = calculateTotalProgress(roadmapGroups);

    return (
        <div style={containerStyle}>
            {/* 체크리스트 미리보기 박스 */}
            <div style={previewWrapper}>
                <ChecklistPreview userInfo={userInfo} />
            </div>

            {/* 헤더 */}
            <header style={roadmapHeaderStyle}>
                <h2>🚀 {userInfo?.name || '사용자'}님의 온보딩 로드맵</h2>
            </header>

            {/* 전체 진행률 */}
            <div style={progressBoxStyle}>
                <div className='d-flex justify-content-between mb-2'>
                    <strong>전체 진행률</strong>
                    <span>
                        {totalProgress.completed}/{totalProgress.total} 완료 · {totalProgress.percent}%
                    </span>
                </div>

                <div style={progressTrackStyle}>
                    <div style={{
                        width: `${totalProgress.percent}%`,
                        height: '100%',
                        backgroundColor: '#321fdb',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>

            {/* 로드맵 리스트 */}
            <div className="roadmap-container" style={{ padding: '20px 0' }}>
                {loading ? (
                    // 1. 로딩 중일 때
                    <div className="text-center py-5">
                        <CSpinner color="primary" />
                        <p className="mt-3" style={{ color: '#666' }}>
                            {userInfo?.name || '사용자'}님의 데이터를 분석하여 맞춤형 로드맵을 생성 중입니다...
                        </p>
                    </div>
                ) : roadmapGroups.length === 0 ? (
                    // 2. 데이터 없을 때
                    <div className='text-center py-5' style={{ color: '#999' }}>
                        📭 추천 로드맵이 없습니다. 잠시 후 다시 시도해주세요.
                    </div>
                ) : (
                    // 3. 데이터 있을 때 - 로드맵 리스트(드롭다운) 영역
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {roadmapGroups.map((group, idx) => (
                            <div
                                key={idx}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    border: '1px solid #f1f3f5',
                                    marginBottom: '20px'
                                }}
                            >
                                <div
                                    onClick={() => setOpenGroup(openGroup === idx ? null : idx)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        padding: '10px 0'
                                    }}
                                >
                                    {/* 왼쪽: 카테고리 이름 */}
                                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#212529' }}>
                                        📚 {group.category_name}
                                        <span style={{ marginLeft: '10px', fontSize: '12px', color: '#868e96' }}>
                                            {calculateProgress(group.items).completed}/{calculateProgress(group.items).total}
                                            완료 · {calculateProgress(group.items).percent}%
                                        </span>
                                    </div>

                                    {/* 오른쪽: 열기/닫기 */}
                                    <div style={{ fontSize: '13px', color: '#868e96' }}>
                                        {openGroup === idx ? '접기 ▲' : '열기 ▼'}
                                    </div>
                                </div>

                                {openGroup === idx && (
                                    <div style={{ marginTop: '10px' }}>
                                        {group.items?.map((content, i) => (
                                            <CCard
                                                key={i}
                                                className="mb-2 border-0"
                                                style={{
                                                    background: '#f8f9fa',
                                                    borderRadius: '10px',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                                onClick={() => {
                                                    const contentId = content.content_id || content.contentId;
                                                    const itemId = content.item_id || content.itemId;
                                                    const title = content.item_title || content.title;

                                                    console.log("[MyRoadmap] 이동 contentId: ", contentId);
                                                    console.log("[MyRoadmap] 이동 itemId: ", itemId);

                                                    if (!contentId) {
                                                        alert('콘텐츠 ID가 없습니다.');
                                                        return;
                                                    }

                                                    handleLearningClick(contentId, title, itemId);
                                                }}
                                            >
                                                <CCardBody className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div style={{ fontWeight: '500', color: '#212529' }}>
                                                            {content.item_title}
                                                        </div>

                                                        <div style={{ fontSize: '12px', color: '#adb5bd' }}>
                                                            CONTENT {i + 1}
                                                        </div>

                                                        <div style={{ fontSize: '12px', color: '#868e96' }}>
                                                            진행률: {content.rate || 0}%
                                                        </div>
                                                    </div>

                                                    <div className="d-flex align-items-center gap-2">
                                                        {/* 진행 상태 배지 */}
                                                        <CBadge
                                                            color={getStatusBadge(content.status).color}
                                                            shape="rounded-pill"
                                                            style={{ padding: '6px 12px' }}
                                                        >
                                                            {getStatusBadge(content.status).text}
                                                        </CBadge>

                                                        {/* 학습 버튼 */}
                                                        <CBadge
                                                            color="primary"
                                                            shape="rounded-pill"
                                                            style={{ padding: '6px 12px' }}
                                                        >
                                                            학습하기
                                                        </CBadge>
                                                    </div>
                                                </CCardBody>
                                            </CCard>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <hr style={{ border: '0', height: '1px', background: '#eee', margin: '40px 0' }} />
        </div>
    );
}

export default MyRoadmap;