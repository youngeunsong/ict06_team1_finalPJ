/**
 * @FileName : Crawling.js
 * @Description : 사용자 홈 화면 (날씨/뉴스 크롤링 및 업무 현황 요약 등)
 * @Author : 김다솜
 * @Date : 2026. 04. 21
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.21    김다솜        최초 생성/홈 화면 구조 작성
 * @ 2026.04.22    김다솜        크롤링 로직 분리(Crawling.js)
 */

import React, { useEffect, useState } from 'react';
import { CRow, CCol, CWidgetStatsA, CCard, CCardHeader, CCardBody, CListGroup, CListGroupItem, CFormCheck } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSun, cilCloud, cilRain, cilSnowflake, cilClock, cilEducation, cilCalendar, cilCheckCircle } from '@coreui/icons';

import { fetchHomeData } from './Crawling';

const UserHome = ({ userInfo }) => {
  const [homeData, setHomeData] = useState({
    temp: '--',
    desc: '로딩 중...',
    icon: null,
    city: 'Seoul',
    news: 'xxx'
  });

  useEffect(() => {
    console.log("UserHome 진입: 날씨 호출 시도 전");
    const initData = async() => {
      try {
        const data = await fetchHomeData();
        console.log("날씨 호출 성공: ", data);

        setHomeData(prevState => ({
          ...prevState,
          temp: data.temp,
          desc: data.desc,
          icon: data.icon,
          city: data.city,
          news: "헤드라인 테스트"
        }));
      } catch(err) {
        console.error("날씨 호출 실패: ", err);
      }
    };
    initData();
  }, []);

  return (
    <div className="fade-in">
      <h4 className="mb-4 text-dark">{userInfo?.userName}님의 오늘 예정 업무</h4>
      
      {/* [상단 섹션] 날씨 및 뉴스 / 이번 달 근무시간(요약 정보) */}
      <CRow className="mb-4">
        {/* 날씨 및 뉴스 위젯 */}
        <CCol sm={6} lg={4}>
          <CWidgetStatsA
            color="info"
            value={`${homeData.temp}°C`}
            title={`${homeData.city} : ${homeData.desc} | [뉴스] ${homeData.news}`}
            icon={
              homeData.desc?.toLowerCase().includes('cloud') ? <CIcon icon={cilCloud} height={40} className='my-2 text-white' /> :
              homeData.desc?.toLowerCase().includes('rain') ? <CIcon icon={cilRain} height={40} className='my-2 text-white' /> :
              homeData.desc?.toLowerCase().includes('drizzle') ? <CIcon icon={cilRain} height={40} className='my-2 text-white' /> :
              homeData.desc?.toLowerCase().includes('snow') ? <CIcon icon={cilSnowflake} height={40} className='my-2 text-white' /> :
              <CIcon icon={cilSun} height={40} className='my-2 text-white' />
            }
          />
        </CCol>

        {/* 근무시간 위젯 */}
        <CCol sm={6} lg={4}>
          <CWidgetStatsA
            color="dark"
            value="152 / 160시간"
            title="이번 달 누적 근무(95%)"
            icon={<CIcon icon={cilClock} height={40} className="my-2 text-white" />}
          />
          </CCol>

        {/* AI 온보딩/평가 현황 위젯 */}
        <CCol sm={6} lg={4}>
          <CWidgetStatsA
            color="success"
            value="8 / 10단계"
            title="신규 입사자 온보딩 완료 현황"
            icon={<CIcon icon={cilEducation} height={40} className="my-2 text-white" />}
          />
        </CCol>
      </CRow>

      {/* [중단 섹션] 오늘의 일정 및 To-Do(캘린더 연동) */}
      <CRow>
        {/* 오늘의 일정 */}
        <CCol md={6}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="bg-white border-0 py-3">
              <CIcon icon={cilCalendar} className="me-2" />
              <strong>오늘의 일정</strong>
            </CCardHeader>
            <CCardBody>
              <CListGroup flush>
                <CListGroupItem className="border-0 px-0">
                  <span className="badge bg-primary me-2">10:00</span> 팀 주간 회의(회의실 A)
                </CListGroupItem>
                <CListGroupItem className="border-0 px-0 text-muted">
                  <span className="badge bg-secondary me-2">14:00</span> 인사평가 시스템 피드백 미팅
                </CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>

        {/* 할 일(To-Do) */}
        <CCol md={6}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <div>
                <CIcon icon={cilCheckCircle} className="me-2" />
                <strong>오늘 할 일</strong>
              </div>
              <small className="text-primary" style={{cursor: 'pointer'}}>+ 추가</small>
            </CCardHeader>
            <CCardBody>
              <div className="mb-2"><CFormCheck label="근태관리 페이지 UI 수정" /></div>
              <div className="mb-2"><CFormCheck label="API 연동 테스트(날씨/뉴스)" defaultChecked /></div>
              <div className="mb-2"><CFormCheck label="팀 주간 보고서 작성" /></div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* [하단 섹션] 온보딩 상세 내역 */}
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4 shadow-sm border-0">
            <CCardHeader className="bg-light">
              <strong>나의 온보딩 여정</strong>
            </CCardHeader>
            <CCardBody>
              <div className="progress-group mb-4">
                <div className="progress-group-header">
                  <CIcon icon={cilEducation} className="me-2" />
                  <span>사내 문화 교육</span>
                  <span className="ms-auto">100%</span>
                </div>
                <div className="progress-group-bars">
                  <div className="progress progress-xs">
                    <div className="progress-bar bg-success" style={{ width: '100%' }}>
                    </div>
                  </div>
                </div>
              </div>
              <div className="progress-group">
                <div className="progress-group-header">
                  <CIcon icon={cilClock} className="me-2" />
                  <span>기술 스택 온보딩(React/CoreUI)</span>
                  <span className="ms-auto fw-bold">60%</span>
                </div>
                <div className="progress-group-bars">
                  <div className="progress progress-xs">
                    <div className="progress-bar bg-warning" style={{ width: '60%' }}>
                    </div>
                  </div>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
};

export default UserHome;