/**
 * @FileName : UserHome.js
 * @Description : 사용자 홈 화면 (날씨/뉴스 크롤링 및 업무 현황 요약 등)
 * @Author : 김다솜
 * @Date : 2026. 04. 21
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.21    김다솜        최초 생성/홈 화면 구조 작성
 * @ 2026.04.22    김다솜        크롤링 로직 분리(Crawling.js)
 * @ 2026.05.08    김다솜        홈 화면 카드 배치 정리 및 업무 요약 영역 재구성
 */

import React, { useEffect, useState } from 'react';
import { CRow, CCol, CWidgetStatsA, CCard, CCardHeader, CCardBody, CListGroup, CListGroupItem, CFormCheck } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSun, cilClock, cilCalendar, cilCheckCircle } from '@coreui/icons';

import { fetchHomeData } from './Crawling';
import { useUser } from 'src/api/UserContext';
import { useNavigate } from 'react-router-dom';
import { PATH } from 'src/constants/path';
import OnboardingSummaryCard from 'src/pages/onboarding/OnboardingSummaryCard';
import axiosInstance from 'src/api/axiosInstance';

const UserHome = () => {
  const navigate = useNavigate();
  const {userInfo} = useUser();
  const [todoList, setTodoList] = useState([]);
  const [homeData, setHomeData] = useState({
    temp: '--',
    desc: '로딩 중...',
    icon: cilSun,
    city: 'Seoul',
    newsList: []
  });

  useEffect(() => {
    const initData = async() => {
      console.log("UserHome 진입: 날씨 호출 시작");
      
      try {
        const data = await fetchHomeData();
        console.log("뉴스 리스트: ", data.newsList);

        setHomeData({
          temp: data.temp,
          desc: data.desc,
          icon: data.icon || cilSun,
          city: data.city,
          newsList: data.newsList
        });
      } catch(err) {
        console.error("날씨 호출 실패: ", err);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if(!userInfo?.empNo)
      return;

    const fetchChecklistTodos = async () => {
      try {
        const res = await axiosInstance.get(
          PATH.API.ONBOARDING.CHECKLIST_LIST(userInfo.empNo)
        );

        const todos = (res.data || [])
          .filter((item) => item.status !== 'COMPLETED')
          .sort((a, b) => {
            if(Boolean(a.isMandatory) !== Boolean(b.isMandatory)) {
              return a.isMandatory ? -1 : 1;
            }
            return (a.orderNo || 0) - (b.orderNo || 0);
          })
          .slice(0, 3);

        setTodoList(todos);
      } catch(err) {
        console.error("체크리스트 To-Do 조회 실패: ", err);
      }
    };

    fetchChecklistTodos();
  }, [userInfo?.empNo]);

  const handleTodoComplete = async (checklistId) => {
    try {
      await axiosInstance.post(PATH.API.ONBOARDING.CHECKLIST_COMPLETE, {
        empNo: userInfo.empNo,
        checklistId
      });

      setTodoList((prev) => prev.filter((item) => item.checklistId !== checklistId));
      window.dispatchEvent(new Event('onboardingProgressUpdated'));
    } catch(err) {
      console.error("홈 To-Do 완료 처리 실패: ", err);
    }
  };

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-4">
        <div>
          <h4 className="mb-1 text-dark">{userInfo?.name}님의 오늘 예정 업무</h4>
          <small className="text-muted">오늘 확인해야 할 온보딩, 일정, 업무 정보를 모았습니다.</small>
        </div>
      </div>

      <CRow className="g-3 mb-4">
        <CCol lg={8}>
          <OnboardingSummaryCard />
        </CCol>

        <CCol lg={4}>
          <CCard className='h-100 border-0 shadow-sm text-white' style={{
            background: 'linear-gradient(45deg, #39f 0%, #2982cc 100%)',
            minHeight: '180px'
          }}>
            <CCardBody className='p-4 d-flex flex-column align-items-center justify-content-center text-center'>
              <CIcon icon={homeData.icon || cilSun} height={46} />
              <div className='fs-1 fw-bold mt-2'>{homeData.temp}°C</div>
              <div className="small fw-medium" style={{ opacity: '0.9' }}>
                {homeData.city} / {homeData.desc}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="g-3">
        <CCol lg={4}>
          <CCard className='h-100 border-0 shadow-sm'>
            <CCardHeader className="bg-white border-0 pt-3 pb-0">
              <strong className='text-info' style={{fontSize: '0.8rem'}}>IT NEWS FLASH</strong>
            </CCardHeader>
            <CCardBody className='pt-2'>
              {homeData.newsList && homeData.newsList.map((item, index) => (
                <div key={index} className='py-1'>
                  <a href={item.link} target="_blank" rel="noreferrer"
                    style={{
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          color: '#333',
                          display: 'block'
                      }}>
                      • {item.title}
                  </a>
                </div>
              ))}
              <div className='mt-2 text-end'>
                <small className='text-muted' style={{fontSize: '0.7rem'}}>출처: 네이버 뉴스</small>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={8}>
          <CRow className="g-3 h-100">
            <CCol md={6}>
              <CWidgetStatsA
                color="dark"
                value="152 / 160시간"
                title="누적 근무 시간"
                action={<CIcon icon={cilClock} height={40} className="my-2 text-white" />}
              />
            </CCol>

            <CCol md={6}>
              <CCard className="h-100 border-0 shadow-sm">
                <CCardHeader className="bg-white border-0 d-flex align-items-center">
                  <CIcon icon={cilCalendar} className="me-2 text-primary" />
                  <strong>오늘의 일정</strong>
                </CCardHeader>
                <CCardBody>
                  <CListGroup flush>
                    <CListGroupItem className="border-0 px-0 py-2 small">
                      <span className="badge bg-primary-light text-primary me-2">10:00</span> 팀 주간 회의(회의실 A)
                    </CListGroupItem>
                    <CListGroupItem className="border-0 px-0 py-2 small">
                      <span className="badge bg-secondary-light text-secondary me-2">14:00</span> 인사평가 시스템 피드백 미팅
                    </CListGroupItem>
                  </CListGroup>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol xs={12}>
              <CCard className="border-0 shadow-sm">
                <CCardHeader className="bg-white border-0 d-flex justify-content-between align-items-center">
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
                    <CRow className="g-2">
                      {todoList.map((item) => (
                        <CCol md={4} key={item.checklistId}>
                          <CFormCheck
                            label={<small>{item.title}</small>}
                            onChange={() => handleTodoComplete(item.checklistId)}
                          />
                          <div className="text-muted" style={{ fontSize: '11px', paddingLeft: '24px' }}>
                            {item.category} · {item.isMandatory ? '필수' : '선택'}
                          </div>
                        </CCol>
                      ))}
                    </CRow>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CCol>
      </CRow>
    </div>
  );
};

export default UserHome;
