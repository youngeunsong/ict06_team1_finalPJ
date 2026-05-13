/**
 * @FileName : UserHome.js
 * @Description : 사용자 홈 피드
 *                - 날씨/뉴스/체크리스트 기반 홈 정보 제공
 *                - 주요 업무 메뉴 바로가기
 *                - 개인 온보딩 진행률 요약 및 추천 학습 이동 안내
 * @Author : 김다솜
 * @Date : 2026. 04. 21
 * @Modification_History
 * @
 * @ 수정일자        수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.21    김다솜        최초 생성 및 홈 화면 구조 작성
 * @ 2026.04.22    김다솜        크롤링 로직 분리(Crawling.js)
 * @ 2026.05.08    김다솜        홈 화면 카드 배치 정리 및 업무 요약 영역 재구성
 * @ 2026.05.12    김다솜        홈 피드 업무 허브 구성, 날씨/뉴스/체크리스트 복구, To-Do 완료 표시 유지, 온보딩 요약/추천 학습 이동 및 전체화면 중앙 정렬 처리
 */

import React, { useEffect, useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormCheck,
  CProgress,
  CProgressBar,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCalendar, cilCheckCircle, cilClock, cilSun } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import axiosInstance from 'src/api/axiosInstance';
import { useUser } from 'src/api/UserContext';
import { PATH } from 'src/constants/path';
import { userHomePageStyle, userWelcomeSection, progressLabel } from 'src/styles/js/common/UserHomeStyle';
import { badgeAiTag, cardCore, COLORS } from 'src/styles/js/onboarding/OnboardingStyle';
import { fetchHomeData } from './Crawling';

const buildHomeFeedData = (dashboardData, roadmapGroups = []) => {
  const categoryProgresses = dashboardData?.categoryProgresses || [];
  const incompleteCategories = categoryProgresses.filter((category) => category.progressPercent < 100);

  const recommendations = roadmapGroups
    .flatMap((group) =>
      (group.items || [])
        .filter((item) => item.status !== 'COMPLETED')
        .map((item) => ({
          title: item.item_title || item.title || group.category_name,
          type: group.category_name,
          contentId: item.content_id || item.contentId,
          itemId: item.item_id || item.itemId,
          categoryName: group.category_name,
        }))
    )
    .slice(0, 3);

  return {
    totalProgress: dashboardData?.learningProgressPercent ?? 0,
    checklist: {
      completed: dashboardData?.completedChecklistCount ?? 0,
      total: dashboardData?.totalChecklistCount ?? 0,
    },
    evaluation: {
      passRate: dashboardData?.evaluationPassRatePercent ?? 0,
    },
    aiCoaching: incompleteCategories.length,
    firstIncompleteCategory: incompleteCategories[0]?.categoryName || recommendations[0]?.categoryName,
    recommendations,
  };
};

const UserHome = () => {
  const { userInfo } = useUser();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [roadmapGroups, setRoadmapGroups] = useState([]);
  const [todoList, setTodoList] = useState([]);
  const [homeData, setHomeData] = useState({
    temp: '--',
    desc: '로딩 중...',
    icon: cilSun,
    city: 'Seoul',
    newsList: [],
  });

  useEffect(() => {
    const initHomeData = async () => {
      try {
        const data = await fetchHomeData();

        setHomeData({
          temp: data.temp,
          desc: data.desc,
          icon: data.icon || cilSun,
          city: data.city,
          newsList: data.newsList || [],
        });
      } catch (error) {
        console.error('[UserHome] 날씨/뉴스 데이터 로드 실패:', error);
      }
    };

    initHomeData();
  }, []);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      const empNo = userInfo?.empNo || userInfo?.emp_no;
      if (!empNo) return;

      try {
        const [dashboardResponse, roadmapResponse, checklistResponse] = await Promise.all([
          axiosInstance.get(PATH.API.ONBOARDING.DASHBOARD(empNo)),
          axiosInstance.get(PATH.API.ONBOARDING.ROADMAP(empNo)),
          axiosInstance.get(PATH.API.ONBOARDING.CHECKLIST_LIST(empNo)),
        ]);

        const todos = (checklistResponse.data || [])
          .filter((item) => item.status !== 'COMPLETED')
          .sort((a, b) => {
            if (Boolean(a.isMandatory) !== Boolean(b.isMandatory)) {
              return a.isMandatory ? -1 : 1;
            }
            return (a.orderNo || 0) - (b.orderNo || 0);
          })
          .slice(0, 3);

        setDashboardData(dashboardResponse.data);
        setRoadmapGroups(roadmapResponse.data?.recommended_roadmap || []);
        setTodoList(todos);
      } catch (error) {
        console.error('[UserHome] 온보딩 홈 피드 데이터 로드 실패:', error);
      }
    };

    fetchOnboardingData();
  }, [userInfo?.empNo, userInfo?.emp_no]);

  const data = buildHomeFeedData(dashboardData, roadmapGroups);

  const quickLinks = [
    {
      label: '일정 관리',
      description: '오늘 일정과 캘린더를 확인합니다.',
      path: PATH.CALENDAR.ROOT,
      color: COLORS.primary,
      icon: cilCalendar,
    },
    {
      label: '근태 관리',
      description: '출퇴근, 근태 현황을 확인합니다.',
      path: PATH.ATTENDANCE.ROOT,
      color: COLORS.success,
      icon: cilClock,
    },
    {
      label: '전자결재',
      description: '결재 문서와 대기 건을 확인합니다.',
      path: PATH.APPROVAL.ROOT,
      color: COLORS.warning,
      icon: cilCheckCircle,
    },
    {
      label: '사내 AI 포털',
      description: 'AI 비서와 문서 지원 기능을 사용합니다.',
      path: PATH.AI.ASSISTANT,
      color: COLORS.info,
      icon: cilSun,
    },
  ];

  const goRoadmapFocus = (categoryName = data.firstIncompleteCategory) => {
    navigate(PATH.ONBOARDING.ROADMAP, {
      state: categoryName ? { focusCategory: categoryName } : {},
    });
  };

  const goLearning = (recommendation) => {
    if (recommendation.contentId) {
      navigate(PATH.ONBOARDING.LEARNING(recommendation.contentId), {
        state: {
          title: recommendation.title,
          itemId: recommendation.itemId,
          userInfo,
        },
      });
      return;
    }

    goRoadmapFocus(recommendation.categoryName);
  };

  const handleTodoToggle = async (item) => {
    const empNo = userInfo?.empNo || userInfo?.emp_no;
    if (!empNo) return;

    const isCurrentlyCompleted = item.status === 'COMPLETED';
    const apiPath = isCurrentlyCompleted 
      ? PATH.API.ONBOARDING.CHECKLIST_UNCOMPLETE 
      : PATH.API.ONBOARDING.CHECKLIST_COMPLETE;

    try {
      await axiosInstance.post(apiPath, {
        empNo,
        checklistId: item.checklistId,
      });

      setTodoList((prev) =>
        prev.map((todo) =>
          todo.checklistId === item.checklistId 
            ? { ...todo, status: isCurrentlyCompleted ? 'NOT_STARTED' : 'COMPLETED' } 
            : todo
        )
      );
      window.dispatchEvent(new Event('onboardingProgressUpdated'));
    } catch (error) {
      console.error('[UserHome] 홈 체크리스트 상태 변경 실패:', error);
    }
  };

  return (
    <div style={userHomePageStyle}>
      <div style={userWelcomeSection}>
        <h2 className="fw-bold mb-1">{userInfo?.name || '사용자'}님, 환영합니다!</h2>
        <p className="mb-0 opacity-75">
          날씨와 뉴스로 하루를 시작하고, 필요한 업무와 온보딩 학습으로 빠르게 이동해 보세요.
        </p>
      </div>

      <CRow className="mb-4 justify-content-center">
        {quickLinks.map((link) => (
          <CCol key={link.label} xs={12} sm={6} lg={3} className="mb-3">
            <CCard
              className="h-100 border-0 shadow-sm"
              style={{ ...cardCore, borderTopColor: link.color, cursor: 'pointer' }}
              onClick={() => navigate(link.path)}
            >
              <CCardBody className="py-3 d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle text-white"
                  style={{ width: 40, height: 40, backgroundColor: link.color, flexShrink: 0 }}
                >
                  <CIcon icon={link.icon} height={20} />
                </div>
                <div>
                  <div className="fw-bold text-dark mb-1">{link.label}</div>
                  <div className="small text-muted">{link.description}</div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <CRow className="justify-content-center">
        <CCol lg={8} className="mb-4">
          <CCard className="border-0 shadow-sm h-100">
            <CCardHeader className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-dark">
                온보딩 진행 요약 <span className="badge ms-2" style={badgeAiTag}>AI Roadmap</span>
              </h5>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => goRoadmapFocus()}>
                로드맵 보기
              </button>
            </CCardHeader>
            <CCardBody className="py-4">
              <div className="d-flex justify-content-between align-items-end mb-2">
                <span style={progressLabel}>전체 학습 진행률</span>
                <span className="h4 mb-0 fw-bold text-primary">{data.totalProgress}%</span>
              </div>
              <CProgress height={12} className="bg-light mb-4">
                <CProgressBar color="primary" value={data.totalProgress} animated={data.totalProgress < 100} />
              </CProgress>

              <CRow>
                <CCol xs={12} md={4} className="mb-3 mb-md-0">
                  <div className="small text-muted">체크리스트</div>
                  <div className="fw-bold text-dark">{data.checklist.completed} / {data.checklist.total}</div>
                </CCol>
                <CCol xs={12} md={4} className="mb-3 mb-md-0">
                  <div className="small text-muted">평가 통과율</div>
                  <div className="fw-bold text-dark">{data.evaluation.passRate}%</div>
                </CCol>
                <CCol xs={12} md={4}>
                  <div className="small text-muted">AI 코칭 제안</div>
                  <button type="button" className="btn btn-link p-0 fw-bold" onClick={() => goRoadmapFocus()}>
                    {data.aiCoaching}건 확인
                  </button>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={4} className="mb-4">
          <CCard
            className="h-100 border-0 shadow-sm text-white"
            style={{
              background: 'linear-gradient(135deg, #3399ff 0%, #1f2a56 100%)',
              minHeight: '190px',
            }}
          >
            <CCardBody className="p-4 d-flex flex-column align-items-center justify-content-center text-center">
              <CIcon icon={homeData.icon || cilSun} height={46} />
              <div className="fs-1 fw-bold mt-2">{homeData.temp}°C</div>
              <div className="small fw-medium" style={{ opacity: '0.9' }}>
                {homeData.city} / {homeData.desc}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="justify-content-center">
        <CCol lg={4} className="mb-4">
          <CCard className="border-0 shadow-sm h-100">
            <CCardHeader className="bg-white border-0 py-3">
              <strong className="text-info" style={{ fontSize: '0.8rem' }}>IT NEWS FLASH</strong>
            </CCardHeader>
            <CCardBody className="pt-0">
              {(homeData.newsList || []).slice(0, 5).map((item, index) => (
                <div key={`${item.title}-${index}`} className="py-2 border-bottom">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-decoration-none text-dark small"
                  >
                    {item.title}
                  </a>
                </div>
              ))}
              <div className="mt-2 text-end">
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>출처: 네이버 뉴스</small>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={4} className="mb-4">
          <CCard className="border-0 shadow-sm h-100">
            <CCardHeader className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <div>
                <CIcon icon={cilCheckCircle} className="me-2 text-success" />
                <strong>To-Do List</strong>
              </div>
              <small
                className="text-primary"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(PATH.ONBOARDING.CHECKLIST)}
              >
                전체 보기
              </small>
            </CCardHeader>
            <CCardBody>
              {todoList.length === 0 ? (
                <div className="text-muted small">남은 체크리스트가 없습니다.</div>
              ) : (
                todoList.map((item) => {
                  const isCompleted = item.status === 'COMPLETED';

                  return (
                  <div
                    key={item.checklistId}
                    className="mb-3"
                    style={{
                      opacity: isCompleted ? 0.65 : 1,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <CFormCheck
                      checked={isCompleted}
                      label={
                        <small
                          style={{
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            color: isCompleted ? '#6c757d' : 'inherit',
                          }}
                        >
                          {item.title}
                        </small>
                      }
                      onChange={() => handleTodoToggle(item)}
                    />
                    <div className="text-muted" style={{ fontSize: '11px', paddingLeft: '24px' }}>
                      {item.category} · {item.isMandatory ? '필수' : '선택'}
                    </div>
                  </div>
                  );
                })
              )}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={4} className="mb-4">
          <CCard className="border-0 shadow-sm h-100">
            <CCardHeader className="bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold text-dark">다음 추천 학습</h5>
            </CCardHeader>
            <CCardBody className="p-0">
              <div className="list-group list-group-flush">
                {data.recommendations.length === 0 ? (
                  <div className="list-group-item px-4 py-3 text-muted small">
                    현재 이어갈 추천 학습이 없습니다.
                  </div>
                ) : (
                  data.recommendations.map((rec, idx) => (
                    <button
                      key={`${rec.contentId || rec.categoryName}-${idx}`}
                      type="button"
                      className="list-group-item list-group-item-action px-4 py-3 border-0"
                      style={{
                        borderBottom: idx === data.recommendations.length - 1 ? 'none' : '1px solid #edf0f2',
                        textAlign: 'left',
                      }}
                      onClick={() => goLearning(rec)}
                    >
                      <div className="small text-muted mb-1">{rec.type}</div>
                      <div className="fw-bold text-dark">{rec.title}</div>
                    </button>
                  ))
                )}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default UserHome;
