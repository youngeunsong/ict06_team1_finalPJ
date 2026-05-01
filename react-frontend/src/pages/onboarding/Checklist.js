/**
 * @FileName : Checklist.js
 * @Description : AI 온보딩 > 체크리스트 화면
 *                - 체크리스트 목록 조회
 *                - 체크리스트 완료 처리
 *                - 개인별 진행 상태 표시
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성 및 체크리스트 조회/완료 기능 구현
 */

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from 'src/api/UserContext';
import { PATH } from 'src/constants/path';
import { actionButton, actionButtonCompleted, actionButtonPending, actionButtonPrimary, actionButtonSuccess, checkDoneIcon, checklistActionRow, checklistCategory, checklistGrid, checklistItem, checklistItemCompleted, checklistItemMandatory, checklistTitle, checkTodoIcon, mandatoryBadge, optionalBadge } from 'src/styles/js/onboarding/ChecklistStyle';

const Checklist = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const { userInfo } = useUser();
    const [checklist, setChecklist] = useState([]);
    const [loading, setLoading] = useState(true);

    //체크리스트 조회
    useEffect(() => {
        const fetchChecklist = async () => {
            if (!userInfo?.empNo) {
                setLoading(false);
                return;
            }

            try {
                const url = `${PATH.API.BASE}${PATH.API.CHECKLIST_LIST(userInfo.empNo)}`;
                const res = await axios.get(url);
                setChecklist(res.data);
            } catch (err) {
                console.error("체크리스트 조회 실패", err);
            } finally {
                setLoading(false);
            }
        };

        fetchChecklist();
    }, [userInfo]);

    //학습 상세페이지에서 체크리스트 완료 후 돌아왔을 때
    //전달받은 updatedChecklistId에 해당하는 항목을 즉시 완료 상태로 변경
    useEffect(() => {
        const updatedChecklistId = location.state?.updatedChecklistId;

        if (!updatedChecklistId) return;

        setChecklist((prev) =>
            prev.map((item) =>
                Number(item.checklistId) === Number(updatedChecklistId)
                    ? { ...item, status: 'COMPLETED' }
                    : item
            )
        );

        //state 반복 적용 방지
        navigate(location.pathname, { replace: true, state: {} });
    }, [location.state, location.pathname, navigate]);

    //완료 처리
    const handleComplete = async (checklistId) => {
        try {
            const url = `${PATH.API.BASE}${PATH.API.CHECKLIST_COMPLETE}`;

            await axios.post(url, {
                empNo: userInfo.empNo,
                checklistId
            });

            //즉시 UI 반영
            setChecklist(prev =>
                prev.map(item =>
                    item.checklistId === checklistId
                        ? { ...item, status: 'COMPLETED' }
                        : item
                )
            );
        } catch (err) {
            console.error("완료 처리 실패", err);
        }
    };

    //미완료 처리
    const handleUncomplete = async (checklistId) => {
        try {
            const url = `${PATH.API.BASE}${PATH.API.CHECKLIST_UNCOMPLETE}`;

            await axios.post(url, {
                empNo: userInfo.empNo,
                checklistId
            });

            setChecklist(prev =>
                prev.map(item =>
                    item.checklistId === checklistId
                        ? { ...item, status: 'NOT_STARTED' }
                        : item
                )
            );
        } catch (err) {
            console.error("완료 취소 실패", err);
        }
    };

    if (loading)
        return <div>Loading...</div>;

    /**
     * 체크리스트 전체 진행률 계산
     * 
     * :param {Array} items - 체크리스트 목록
     * :returns {{ completed: number, total: number, percent: number }}
     */
    const calculateProgress = (items = []) => {
        const total = items.length;
        const completed = items.filter((item) => item.status === 'COMPLETED').length;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        return { completed, total, percent };
    };

    const progress = calculateProgress(checklist);

    return (
        <div style={{ padding: '20px' }}>
            <h2>📋 온보딩 체크리스트</h2>

            {/* 1. 체크리스트 진행률 */}
            <div style={{
                margin: '20px 0',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px'
            }}>
                <div className='d-flex justify-content-between mb-2'>
                    <strong>체크리스트 진행률</strong>
                    <span>{progress.completed}/{progress.total} 완료 · {progress.percent}%</span>
                </div>

                <div style={{
                    height: '10px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '5px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress.percent}%`,
                        height: '100%',
                        backgroundColor: '#321fdb',
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>

            {/* 2. 체크리스트 리스트 섹션 */}
            <div style={checklistGrid}>
                {checklist.map((item) => (
                    <div
                        key={item.checklistId}
                        className={`checklist-card ${item.isMandatory ? 'mandatory' : ''}`}
                        style={item.status === 'COMPLETED'
                            ? checklistItemCompleted
                            : item.isMandatory
                                ? checklistItemMandatory
                                : checklistItem
                        }
                    >
                        <div>
                            <div style={checklistTitle}>
                                <span style={item.status === 'COMPLETED' ? checkDoneIcon : checkTodoIcon}></span>
                                {item.title}
                            </div>

                            {/* 필수 여부 */}
                            <div style={checklistCategory}>
                                {item.category}
                                <span style={item.isMandatory ? mandatoryBadge : optionalBadge}>
                                    {item.isMandatory ? '필수' : '선택'}
                                </span>
                            </div>
                        </div>

                        <div style={checklistActionRow}>
                            {/* 상태 배지 */}
                            <div>
                                {item.status === 'COMPLETED' ? (
                                    <button
                                        className='checklist-action-btn'
                                        style={actionButtonPending}
                                        onClick={() => handleUncomplete(item.checklistId)}
                                    >
                                        되돌리기
                                    </button>
                                ) : (
                                    <span style={actionButtonPending}>미완료</span>
                                )}
                            </div>

                            {/* 액션 버튼 */}
                            {item.status !== 'COMPLETED' && (
                                item.relatedContentId ? (
                                    //연관 학습 콘텐츠 있음 -> 학습하기
                                    <button
                                        className='checklist-action-btn'
                                        style={actionButtonPrimary}
                                        onClick={() => {
                                            console.log("[Checklist] 학습 이동 item:", item);
                                            console.log("[Checklist] 전달 checklistId:", item.checklistId);
                                            console.log("[Checklist] 전달 contentId:", item.relatedContentId);

                                            navigate(PATH.ONBOARDING.LEARNING(item.relatedContentId), {
                                                state: {
                                                    title: item.relatedContentTitle || item.title,
                                                    checklistId: item.checklistId,
                                                    userInfo
                                                }
                                            })
                                        }
                                        }
                                    >
                                        학습하기
                                    </button>
                                ) : (
                                    //연관 학습 콘텐츠 없음 -> 바로 완료
                                    <button
                                        className='checklist-action-btn success'
                                        style={actionButtonSuccess}
                                        onClick={() => handleComplete(item.checklistId)}
                                    >
                                        완료하기
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Checklist;