import { CBadge, CCard, CCardBody, CSpinner } from '@coreui/react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import axiosInstance from 'src/api/axiosInstance';
import { PATH } from 'src/constants/path';
import { containerStyle } from 'src/styles/js/demoPageStyle';
import { previewWrapper } from 'src/styles/js/onboarding/ChecklistStyle';
import {
  progressBoxStyle,
  progressTrackStyle,
  quizButtonAreaStyle,
  quizButtonStyle,
  roadmapHeaderStyle,
} from 'src/styles/js/onboarding/RoadmapStyle';

import ChecklistPreview from './ChecklistPreview';

function MyRoadmap({ userInfo }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [roadmapGroups, setRoadmapGroups] = useState([]);
  const [openGroup, setOpenGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluationResults, setEvaluationResults] = useState([]);

  const handleLearningClick = (contentId, title, itemId) => {
    navigate(PATH.ONBOARDING.LEARNING(contentId), {
      state: { title, itemId, userInfo },
    });
  };

  useEffect(() => {
    const loadRoadmap = async () => {
      const empNo = userInfo?.empNo;

      if (!empNo) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(PATH.API.ONBOARDING.ROADMAP(empNo));
        setRoadmapGroups(response.data?.recommended_roadmap || []);
      } catch (err) {
        console.error('[MyRoadmap] roadmap load failed:', err);
        setRoadmapGroups([]);
      } finally {
        setLoading(false);
      }
    };

    loadRoadmap();
  }, [userInfo]);

  useEffect(() => {
    if (!userInfo?.empNo) return;

    const loadEvaluationResults = async () => {
      try {
        const res = await axiosInstance.get(PATH.API.EVALUATION.QUIZ_RESULT(userInfo.empNo));
        setEvaluationResults(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('[MyRoadmap] evaluation result load failed:', err);
      }
    };

    loadEvaluationResults();
  }, [userInfo?.empNo]);

  useEffect(() => {
    const updatedItemId = location.state?.updatedItemId;
    if (!updatedItemId) return;

    setRoadmapGroups((prevGroups) =>
      prevGroups.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          Number(item.item_id || item.itemId) === Number(updatedItemId)
            ? { ...item, status: 'COMPLETED', rate: 100 }
            : item
        ),
      }))
    );

    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    const focusCategory = location.state?.focusCategory;
    if (!focusCategory || roadmapGroups.length === 0) return;

    const targetIndex = roadmapGroups.findIndex((group) => group.category_name === focusCategory);
    if (targetIndex >= 0) {
      setOpenGroup(targetIndex);
      setTimeout(() => {
        const targetElement = document.getElementById(`roadmap-category-${targetIndex}`);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 80);
    }
  }, [location.state, roadmapGroups]);

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

  const calculateProgress = (items = []) => {
    const total = items.length;
    const completed = items.filter((item) => item.status === 'COMPLETED').length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, total, percent };
  };

  const calculateTotalProgress = (roadmap = []) => {
    let total = 0;
    let completed = 0;

    roadmap.forEach((group) => {
      total += group.items.length;
      completed += group.items.filter((item) => item.status === 'COMPLETED').length;
    });

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  };

  const totalProgress = calculateTotalProgress(roadmapGroups);

  if (!userInfo) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p>사용자 정보를 불러오는 중입니다.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={previewWrapper}>
        <ChecklistPreview userInfo={userInfo} />
      </div>

      <header style={roadmapHeaderStyle}>
        <h2>{`${userInfo?.name || '사용자'}님의 AI 온보딩 로드맵`}</h2>
      </header>

      <div style={progressBoxStyle}>
        <div className="d-flex justify-content-between mb-2">
          <strong>전체 진행률</strong>
          <span>
            {totalProgress.completed}/{totalProgress.total} 완료 · {totalProgress.percent}%
          </span>
        </div>

        <div style={progressTrackStyle}>
          <div
            style={{
              width: `${totalProgress.percent}%`,
              height: '100%',
              backgroundColor: '#321fdb',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <div className="roadmap-container" style={{ padding: '20px 0' }}>
        {loading ? (
          <div className="text-center py-5">
            <CSpinner color="primary" />
            <p className="mt-3" style={{ color: '#666' }}>
              {`${userInfo?.name || '사용자'}님의 데이터를 분석해 로드맵을 불러오는 중입니다.`}
            </p>
          </div>
        ) : roadmapGroups.length === 0 ? (
          <div className="text-center py-5" style={{ color: '#999' }}>
            추천 로드맵이 없습니다. 잠시 후 다시 시도해주세요.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {roadmapGroups.map((group, idx) => {
              const progress = calculateProgress(group.items);
              const isCategoryCompleted = progress.completed === progress.total;
              const evaluationResult = evaluationResults.find(
                (result) => result.categoryName === group.category_name
              );
              const isSubmitted = evaluationResult?.submitted;
              const isPassed = evaluationResult?.passed;

              return (
                <div
                  key={idx}
                  id={`roadmap-category-${idx}`}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1px solid #f1f3f5',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    onClick={() => setOpenGroup(openGroup === idx ? null : idx)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '10px 0',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px', color: '#212529' }}>
                        {group.category_name}
                        <span style={{ marginLeft: '10px', fontSize: '12px', color: '#868e96' }}>
                          {progress.completed}/{progress.total} 완료 · {progress.percent}%
                        </span>
                      </div>

                      <div style={{ marginTop: '6px', fontSize: '13px', color: '#6c757d' }}>
                        {!isCategoryCompleted
                          ? `학습 진행 중 (${progress.completed}/${progress.total})`
                          : isPassed
                            ? '평가 통과 완료'
                            : isSubmitted
                              ? '평가 재응시 필요'
                              : '학습 완료 / 평가 미응시'}
                      </div>
                    </div>

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
                            cursor: 'pointer',
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

                            if (!contentId) {
                              alert('콘텐츠 정보가 없습니다.');
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

                              {content.recommendation_reason && (
                                <div
                                  style={{
                                    marginTop: '6px',
                                    fontSize: '12px',
                                    color: '#495057',
                                    maxWidth: '520px',
                                    lineHeight: 1.5,
                                  }}
                                >
                                  추천 사유: {content.recommendation_reason}
                                </div>
                              )}

                              <div style={{ fontSize: '12px', color: '#adb5bd' }}>
                                CONTENT {i + 1}
                              </div>

                              <div style={{ fontSize: '12px', color: '#868e96' }}>
                                진행률 {content.rate || 0}%
                              </div>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              <CBadge
                                color={getStatusBadge(content.status).color}
                                shape="rounded-pill"
                                style={{ padding: '6px 12px' }}
                              >
                                {getStatusBadge(content.status).text}
                              </CBadge>

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

                      <div style={quizButtonAreaStyle}>
                        <button
                          className={`btn btn-sm ${
                            !isCategoryCompleted
                              ? 'btn-secondary'
                              : isPassed
                                ? 'btn-success'
                                : isSubmitted
                                  ? 'btn-warning'
                                  : 'btn-primary'
                          }`}
                          style={{
                            ...quizButtonStyle,
                            opacity: isPassed ? 0.85 : 1,
                            cursor: isPassed ? 'default' : 'pointer',
                          }}
                          disabled={!isCategoryCompleted || isPassed}
                          onClick={() => navigate(PATH.EVALUATION.QUIZ(group.category_name))}
                        >
                          {!isCategoryCompleted
                            ? '학습 완료 후 응시 가능'
                            : isPassed
                              ? '평가 통과'
                              : isSubmitted
                                ? '재응시 필요'
                                : '퀴즈 보기'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <hr style={{ border: 0, height: '1px', background: '#eee', margin: '40px 0' }} />
    </div>
  );
}

export default MyRoadmap;
