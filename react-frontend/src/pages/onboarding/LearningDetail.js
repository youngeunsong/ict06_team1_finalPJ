/**
 * @FileName : LearningDetail.js
 * @Description : AI 온보딩 학습 콘텐츠 상세 페이지
 *                - 콘텐츠 상세 정보 조회
 *                - 콘텐츠 유형별 렌더링 처리(VIDEO/PDF/LINK/QUIZ)
 *                - 학습 완료 처리 및 진행 상태 저장
 *                - 학습 완료 후 로드맵 화면 상태 즉시 반영
 * @Author : 김다솜
 * @Date : 2026. 04. 28
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.28    김다솜        최초 생성 및 로드맵 콘텐츠 상세 조회/타입별 렌더링 구현
 * @ 2026.04.29    김다솜        학습 완료 처리 API 연동 및 로드맵 상태 반영 로직 추가
 */

import { CButton, CCard, CCardBody, CCardHeader, CSpinner } from '@coreui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from 'src/api/axiosInstance';
import { useUser } from 'src/api/UserContext';
import { PATH } from 'src/constants/path';
import { containerStyle } from 'src/styles/js/demoPageStyle';

const LearningDetail = () => {
    const { contentId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { userInfo, userLoading } = useUser();
    
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const pageTitle = location.state?.title || "학습 상세 정보";
    const displayTitle = content?.title || pageTitle;
    const itemId = location.state?.itemId;
    const checklistId = location.state?.checklistId;

    //외부 URL 여부 확인
    const isExternalUrl = (url) => {
        return url?.startsWith('http://') || url?.startsWith('https://');
    };

    const isEmbeddableUrl = (url) => {
        if(!isExternalUrl(url))
            return false;

        return (
            url.includes('youtube.com/embed') || url.includes('mozilla.github.io')
        );
    };

    //학습 완료 버튼 클릭 핸들러
    //DB 저장 API 연결 전이므로 itemId 전달 여부만 확인
    const handleCompleteLearning = async() => {
        try {
            const empNo = userInfo?.empNo;

            if(!empNo) {
                alert("사용자 정보가 없습니다.");
                return;
            }

            console.log("[LearningDetail] 완료 요청", { empNo, itemId, checklistId, contentId });

            //학습 완료 저장
            // → Spring 서버 호출 → axiosInstance 사용 → PATH.API.ONBOARDING.PROGRESS_COMPLETE

            //2-1. 로드맵에서 진입한 경우(ROAD_PROGRESS 저장)
            if(itemId) {
                await axiosInstance.post(PATH.API.ONBOARDING.PROGRESS_COMPLETE,
                    {
                        empNo,
                        itemId
                    }
                );
            }

            //2-2. 체크리스트에서 진입한 경우 -> 로드맵+체크리스트 자동 완료 처리(CHECKLIST_PROGRESS 저장)
            // -> 체크리스트와 학습 콘텐츠 간 연동 위함
            if(checklistId) {
                const checklistUrl = `${PATH.API.BASE}${PATH.API.ONBOARDING.CHECKLIST_COMPLETE}`;

                await axiosInstance.post(PATH.API.ONBOARDING.CHECKLIST_COMPLETE,
                    {
                        empNo,
                        checklistId
                    }
                );
                
                toast.success("학습 및 체크리스트 완료!", {
                    icon: "🎉"
                });

                navigate(PATH.ONBOARDING.CHECKLIST, {
                    state: { updatedChecklistId: checklistId }
                });
            } else {
                toast.success("학습 완료!", {
                    icon: "🎉"
                });

                navigate(PATH.ONBOARDING.ROADMAP, {
                    state: { updatedItemId: itemId }
                });
            }

            console.log("[LearningDetail] 완료 처리 itemId: ", itemId);
            console.log("[LearningDetail] 완료 처리 contentId: ", contentId);
        } catch(err) {
            console.error("학습 완료 저장 실패", err);
            alert("학습 완료 저장 중 오류가 발생했습니다.");
        }
    };

    // 학습 콘텐츠 상세 조회
    // → AI 서버 호출 → axios 사용 → PATH.AI_API.BASE + PATH.AI_API.CONTENT_DETAIL(contentId)
    useEffect(() => {
        //백엔드에서 만든 단일 조회 API 호출
        const fetchDetail = async() => {
            try {
                setLoading(true);
                setError(null);

                // const response = await axiosInstance.get(PATH.AI_API.CONTENT_DETAIL(contentId));
                const url = `${PATH.AI_API.BASE}${PATH.AI_API.CONTENT_DETAIL(contentId)}`;
                console.log("[LearningDetail] 콘텐츠 상세 요청 URL:", url);

                const response = await axios.get(url);
                console.log("[LearningDetail] 응답 data:", response.data);

                if(!response.data || response.data.error) {
                    setContent(null);
                    setError(response.data?.error || "콘텐츠를 찾을 수 없습니다.");
                    return;
                }

                setContent(response.data);
            } catch(err) {
                console.error("학습 자료 로드 실패", err);
                setContent(null);
                setError("학습 콘텐츠를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [contentId]);

    // 사용자 인증 로딩 처리
    if(userLoading) {
        return (
            <div className='text-center py-5'>
                <CSpinner color='primary' />
                <p>사용자 인증 확인 중...</p>
            </div>
        );
    }

    // 콘텐츠 로딩 처리
    if(loading) {
        return (
            <div className='text-center py-5'>
                <CSpinner color='primary' />
                <p>학습 콘텐츠를 불러오는 중입니다...</p>
            </div>
        );
    }
    
    if(!userLoading && !userInfo) {
        alert("로그인이 필요한 서비스입니다.");
        navigate(PATH.AUTH.LOGIN);
        return null;
    }
    
    // 콘텐츠 없을 때
    if(!content) {
        return (
            <div className='text-center py-5'>
                <h4>{error || "콘텐츠를 찾을 수 없습니다."}</h4>
                <CButton color='primary' onClick={() => navigate(-1)}>뒤로가기</CButton>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <small className='text-muted'>Onboarding Step {contentId}</small>
                    <h2 style={{ fontWeight: 'bold' }}>{displayTitle}</h2>
                </div>
                <CButton
                    color='secondary'
                    variant='outline'
                    onClick={() => navigate(PATH.ONBOARDING.ROADMAP)}>
                    목록으로
                </CButton>
            </header>

            <CCard className='shadow-sm'>
                <CCardHeader className='bg-white py-3'>
                    <strong>{content.type} 학습 모드</strong>
                </CCardHeader>
                <CCardBody>
                    {/* content.path 없을 경우 예외처리 */}
                    {!content.path ? (
                        <div className='py-5 text-center'>
                            <p>준비된 학습 자료가 없습니다. 관리자에게 문의해주세요.</p>
                        </div>
                    ) : (
                        //콘텐츠 타입별 렌더링
                        <div>
                            {content.type === 'VIDEO' && (
                                isEmbeddableUrl(content.path) ? (
                                    <div className='ratio ratio-16x9'>
                                        <iframe
                                            src={content.path}
                                            title="Video content"
                                            allowFullScreen
                                            style={{ borderRadius: '8px' }}
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className='text-center py-5'>
                                        <h5>영상 콘텐츠를 새 탭에서 확인해주세요.</h5>
                                        <p className='text-muted small'>{content.path}</p>
                                        <CButton color='primary' href={content.path} target='_blank' rel='noopener noreferrer'>
                                            영상 열기
                                        </CButton>
                                    </div>
                                )
                            )}
                            {content.type === 'PDF' && (
                                isEmbeddableUrl(content.path) ? (
                                    <div style={{ height: '800px' }}>
                                        <embed
                                            src={content.path}
                                            title="application/pdf"
                                            width="100%"
                                            height="100%"
                                            style={{ borderRadius: '8px' }}
                                            />
                                    </div>
                                ) : (
                                    <div className='text-center py-5'>
                                        <h5>PDF 자료를 새 탭에서 확인해주세요.</h5>
                                        <p className='text-muted small'>{content.path}</p>
                                        <CButton color='primary' href={content.path} target='_blank' rel='noopener noreferrer'>
                                            PDF 열기
                                        </CButton>
                                    </div>
                                )
                            )}
        
                            {content.type === 'LINK' && (
                                <div className='text-center py-5'>
                                    <div className='mb-4'>
                                        <i className='cil-external-link' style={{ fontSize: '3rem', color: '#321fdb'}}></i>
                                    </div>
                                    <h5>이 콘텐츠는 외부 사이트에서 제공됩니다.</h5>
                                    <p className='text-muted'>아래 버튼을 클릭하여 학습을 계속하세요.</p>
                                    <CButton
                                        color='primary'
                                        size='lg'
                                        href={content.path}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        강의 사이트로 이동하기
                                    </CButton>
                                </div>
                            )}

                            {content.type === 'QUIZ' && (
                                <div className='text-center py-5'>
                                    <h5>퀴즈 콘텐츠입니다.</h5>
                                    <p className='text-muted'>아래 버튼을 클릭하여 퀴즈를 시작하세요.</p>
                                    <CButton
                                        color='primary'
                                        size='lg'
                                        onClick={() => navigate(PATH.EVALUATION.QUIZ)}
                                    >
                                        퀴즈 시작하기
                                    </CButton>
                                </div>
                            )}

                            {!['VIDEO', 'PDF', 'LINK', 'QUIZ'].includes(content.type) && (
                                <div className='py-5 text-center'>
                                    <p>지원하지 않는 콘텐츠 유형입니다.</p>
                                </div>
                            )}
                        </div>
                    )}
                </CCardBody>
            </CCard>

            <div className='mt-4 d-flex justify-content-between align-items-center'>
                <p className='text-muted small mb-0'>
                    학습을 완료하셨나요? 완료 버튼을 누르면 진행 상태 저장 API와 연결할 수 있습니다.
                </p>

                <CButton color='success' onClick={handleCompleteLearning}>
                    학습 완료
                </CButton>
            </div>
        </div>
    );
}

export default LearningDetail;