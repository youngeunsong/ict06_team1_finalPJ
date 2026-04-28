import React from 'react';

// CoreUI 
import { CButton, CCard, CCardBody, CCardHeader } from '@coreui/react';

// 페이지 이동
import { Link, useNavigate, useOutletContext } from 'react-router-dom';

// 페이지 전체 레이아웃 스타일
import { containerStyle } from 'src/styles/js/demoPageStyle';

// 경로 상수
import { PATH } from 'src/constants/path';

// 풀캘린더
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';

const Calendar = () => {

    //DefaultLayout.js의 Outlet에서 보낸 userInfo 데이터 받기
    const [userInfo] = useOutletContext();

    // JS 코드로 페이지 이동할 때 사용하는 함수
    const navigate = useNavigate();

    // 백엔드 연결 전까지 화면 확인용으로 사용할 더미 일정 데이터
    const dummyEvents = [
        {
            id: '1',
            title: '팀 회의',
            start: '2026-04-27T10:00:00',
            end: '2026-04-27T11:00:00',
            extendedProps: {
                type: '부서일정',
                category: '회의',
            },
        },
        {
            id: '2',
            title: '프로젝트 일정 공유',
            start: '2026-04-29',
            extendedProps: {
                type: '개인일정',
                category: '업무',
            },
        },
        {
            id: '3',
            title: '전사 공지 일정',
            start: '2026-05-01',
            extendedProps: {
                type: '전사일정',
                category: '공지',
            },
        },
    ];

    // 캘린더 일정 클릭 시 일정 상세 화면으로 이동
    const handleEventClick = (info) => {
        const scheduleId = info.event.id;

        navigate(`${PATH.CALENDAR.DETAIL}?id=${scheduleId}`);
    };

    // 캘린더 메인 화면 스타일
    const calendarLayoutStyle = {
        display: 'grid',
        gridTemplateColumns: '220px 1fr 260px',
        gap: '16px',
        padding: '20px',
    };

    const sidePanelStyle = {
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fff',
    };

    const calendarMainStyle = {
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fff',
    };

    return (
        <div style={containerStyle}>
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between' }}>
                <h2>🚀 {userInfo?.name}님의 캘린더</h2>
            </header>

            <hr style={{ border: '0', height: '1px', background: '#eee', margin: '40px 0' }} />

            {/* 1차 시연용 영역 */}
            <CCard className="mb-4" style={{ height: 'calc(100vh - 120px)' }}>
                <CCardHeader>
                    <strong>일정 관리</strong>
                </CCardHeader>
                <CCardBody className="p-0 d-flex flex-column">
                    <div className="p-2 d-flex justify-content-end">

                        {/* 시연용 화면 이동 버튼 */}
                        {/* path에서 경로 상수 불러오기 */}
                        {/* <Link to="/calendar/simple-add"> */}
                        <Link to={PATH.CALENDAR.SIMPLE_ADD}>
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                            >
                                일정 간단 등록
                            </CButton>
                        </Link>

                        {/* <Link to="/calendar/detail-add"> */}
                        <Link to={PATH.CALENDAR.DETAIL_ADD}>
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                            >
                                상세 등록
                            </CButton>
                        </Link>

                        {/* <Link to="/calendar/detail"> */}
                        <Link to={PATH.CALENDAR.DETAIL}>
                            <CButton
                                color='primary'
                                variant='outline'
                                style={{ fontWeight: 'bold' }}
                            >
                                일정 상세
                            </CButton>
                        </Link>
                    </div>

                    {/* 캘린더 영역 */}
                    <div style={calendarLayoutStyle}>
                        <aside style={sidePanelStyle}>
                            <h5>캘린더</h5>

                            <div style={{ marginTop: '16px' }}>
                                <strong>일정 구분</strong>

                                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label>
                                        <input type="checkbox" defaultChecked /> 개인일정
                                    </label>
                                    <label>
                                        <input type="checkbox" defaultChecked /> 부서일정
                                    </label>
                                    <label>
                                        <input type="checkbox" defaultChecked /> 전사일정
                                    </label>
                                </div>
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <strong>카테고리</strong>

                                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label>
                                        <input type="checkbox" defaultChecked /> 회의
                                    </label>
                                    <label>
                                        <input type="checkbox" defaultChecked /> 업무
                                    </label>
                                    <label>
                                        <input type="checkbox" defaultChecked /> 공지
                                    </label>
                                </div>
                            </div>
                        </aside>

                        <main style={calendarMainStyle}>
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                locale={koLocale}
                                height="auto"
                                events={dummyEvents}
                                eventClick={handleEventClick}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                                }}
                                buttonText={{
                                    today: '오늘',
                                    month: '월',
                                    week: '주',
                                    day: '일',
                                }}
                            />
                        </main>

                        <aside style={sidePanelStyle}>
                            <h5>오늘 일정</h5>

                            <div style={{ marginTop: '16px' }}>
                                <p>등록된 오늘 일정이 없습니다.</p>
                            </div>

                            <div style={{ marginTop: '24px' }}>
                                <strong>예정 일정</strong>

                                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <p>팀 회의</p>
                                    <p>프로젝트 일정 공유</p>
                                    <p>전사 공지 일정</p>
                                </div>
                            </div>

                        </aside>
                    </div>
                </CCardBody>
            </CCard>
        </div>
    );
};

export default Calendar;