import React from 'react';

// CoreUI 
import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react';

// 페이지 이동
import { Link, useLocation, useOutletContext } from 'react-router-dom';

// 페이지 전체 레이아웃 스타일
import { containerStyle } from 'src/styles/js/demoPageStyle';

import { PATH } from 'src/constants/path';

// 일정 상세/삭제
const CalendarDetail = () => {

    //DefaultLayout.js의 Outlet에서 보낸 userInfo 데이터 받기
    const [userInfo] = useOutletContext();

    // 현재 URL 정보 가져오기
    const location = useLocation();

    // URL의 query string에서 id 값 꺼내기
    // 예: /calendar/detail?id=1 -> scheduleId = "1"
    const searchParams = new URLSearchParams(location.search);
    const scheduleId = searchParams.get('id');

    const dummySchedules = [
        {
            id: '1',
            title: '팀 회의',
            type: '부서일정',
            category: '회의',
            start: '2026-04-27 10:00',
            end: '2026-04-27 11:00',
            location: '회의실 A',
            content: '프로젝트 진행상황을 공유하는 회의입니다.',
        },
        {
            id: '2',
            title: '프로젝트 일정 공유',
            type: '개인일정',
            category: '업무',
            start: '2026-04-29',
            end: '2026-04-29',
            location: '온라인',
            content: '프로젝트 일정과 담당 업무를 확인합니다.',
        },
        {
            id: '3',
            title: '전사 공지 일정',
            type: '전사일정',
            category: '공지',
            start: '2026-05-01',
            end: '2026-05-01',
            location: '사내 게시판',
            content: '전사 공지사항 확인 일정입니다.',
        },
    ];

    const selectedSchedule = dummySchedules.find((schedule) => schedule.id === scheduleId);

    return (
        <div style={containerStyle}>

            {/* 일정 상세 영역 */}
            <CCard className="mb-4" style={{ height: 'calc(100vh - 120px)' }}>
                <CCardHeader>
                    <strong>일정 상세 정보</strong>
                </CCardHeader>
                <CCardBody className="p-0 d-flex flex-column">
                    <div style={{ padding: '20px' }}>
                        <h4>{selectedSchedule ? selectedSchedule.title : '선택된 일정이 없습니다.'}</h4>
                        <p>선택된 일정 ID: {scheduleId ? scheduleId : '없음'}</p>

                        {selectedSchedule && (
                            <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
                                <p><strong>일정 구분:</strong> {selectedSchedule.type}</p>
                                <p><strong>카테고리:</strong> {selectedSchedule.category}</p>
                                <p><strong>시작:</strong> {selectedSchedule.start}</p>
                                <p><strong>종료:</strong> {selectedSchedule.end}</p>
                                <p><strong>장소:</strong> {selectedSchedule.location}</p>
                                <p><strong>내용:</strong> {selectedSchedule.content}</p>

                            </div>
                        )}

                        <Link to={PATH.CALENDAR.ROOT}>
                            <CButton color='secondary' variant='outline'>
                                목록으로
                            </CButton>
                        </Link>
                    </div>
                </CCardBody>
            </CCard>
        </div>
    );
};

export default CalendarDetail;