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
 */

import React, { useEffect, useState } from 'react';
import { CRow, CCol, CWidgetStatsA, CCard, CCardHeader, CCardBody, CListGroup, CListGroupItem, CFormCheck } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSun, cilClock, cilEducation, cilCalendar, cilCheckCircle } from '@coreui/icons';

import { fetchHomeData } from './Crawling';

const UserHome = ({ userInfo }) => {
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

  return (
    <div className="fade-in">
      <h4 className="mb-4 text-dark">{userInfo?.name}님의 오늘 예정 업무</h4>
      
      <CRow className="mb-4">

        {/* [상단 섹션] 날씨 및 뉴스 / 이번 달 근무시간(요약 정보) */}
        <CCol lg={4}>
          <div className='p-3 mb-4 rounded-3' style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
            <h6 className='text-muted mb-3 fw-bold'>날씨와 뉴스</h6>
            
            {/* 날씨 카드 */}
            <CCard className='mb-3 border-0 shadow-sm bg-gradient-info text-white' style={{
              background: 'linear-gradient(45deg, #39f 0%, #2982cc 100%)',
              minHeight: '120px'
            }}>
              <CCardBody className='p-3 d-flex flex-column align-items-center justify-content-center'>
                <CIcon icon={homeData.icon || cilSun} height={40} />
                  <div className='fs-2 fw-bold'>{homeData.temp}°C</div>
                  <div className="small fw-medium" style={{ opacity: '0.9' }}>
                    {homeData.city} / {homeData.desc}
                  </div>
              </CCardBody>
            </CCard>

            {/* 뉴스 카드 */}
            <CCard className='border-0 shadow-sm' style={{ minHeight: '180px' }}>
              <CCardHeader className="bg-white border-0 pt-3 pb-0">
                <strong className='text-info' style={{fontSize: '0.8rem'}}>IT NEWS FLASH</strong>
              </CCardHeader>
              <CCardBody className='pt-0'>
                {homeData.newsList && homeData.newsList.map((item, index) => (
                  <div key={index} className='py-1'>
                    <a href={item.link} target="_blank" rel="nonreferrer"
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
          </div>
        </CCol>

        {/* [우측 구역] 업무 알림 카드(현황/일정/To-Do) */}
        <CCol lg={8}>
          <div className='p-3 mb-4 rounded-3' style={{ border: '1px solid #e0e0e0' }}>
            <h6 className='text-muted mb-3 fw-bold'>업무 알림</h6>

            {/* 업무 요약 위젯 */}
            <CRow className='mb-4'>
              {/* 근무 시간 */}
              <CCol sm={6}>
                <CWidgetStatsA
                  color="dark"
                  value="152 / 160시간"
                  title="누적 근무 시간"
                  action={<CIcon icon={cilClock} height={40} className="my-2 text-white" />}
                />
              </CCol>

              {/* AI 온보딩/평가 현황 위젯 */}
              <CCol sm={6}>
                <CWidgetStatsA
                  color="success"
                  value="80%"
                  title="신규 입사자 온보딩 진행률"
                  action={<CIcon icon={cilEducation} height={40} className="my-2 text-white" />}
                  />
              </CCol>
            </CRow>

            {/*  오늘의 일정 및 To-Do */}
            <CRow>
              {/* 오늘의 일정 */}
              <CCol md={6}>
                <CCard className="h-100 border-0 shadow-sm">
                  <CCardHeader className="bg-white border-0">
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

              {/* 할 일(To-Do) */}
              <CCol md={6}>
                <CCard className="h-100 border-0 shadow-sm">
                  <CCardHeader className="bg-light border-0">
                      <CIcon icon={cilCheckCircle} className="me-2 text-success" />
                      <strong>To-Do List</strong>
                    <small className="text-primary" style={{cursor: 'pointer'}}>+ 추가</small>
                  </CCardHeader>
                  <CCardBody>
                    <div className="mb-2"><CFormCheck label={<small>API 연동 테스트(날씨/뉴스)</small>} /></div>
                    <div className="mb-2"><CFormCheck label={<small>Thymeleaf template 테스트</small>} /></div>
                    <div className="mb-2"><CFormCheck label={<small>발표자료 제출</small>} /></div>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </div>
        </CCol>
      
      </CRow>
    </div>
  );
};

export default UserHome;