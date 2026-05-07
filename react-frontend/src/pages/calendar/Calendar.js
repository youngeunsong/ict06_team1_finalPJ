import React, { useEffect, useRef, useState } from 'react';

// CoreUI 
import { CCard, CCardBody } from '@coreui/react';

// 페이지 이동
import { useNavigate } from 'react-router-dom';

// 간편등록 퀵 팝업
import CalendarSimpleAdd from './CalendarSimpleAdd';

// 경로 상수
import { PATH } from 'src/constants/path';
import { request } from 'src/helpers/axios_helper';

// 풀캘린더
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';

const Calendar = () => {

    // JS 코드로 페이지 이동할 때 사용하는 함수
    const navigate = useNavigate();

    // FullCalendar를 직접 제어하기 위한 ref
    const calendarRef = useRef(null);

    // 선택한 날짜
    const [selectedDate, setSelectedDate] = useState(null);

    // 간편등록 퀵 팝업 열림 여부
    const [simpleAddVisible, setSimpleAddVisible] = useState(false);

    // 간편등록 퀵 팝업 위치
    const [popupPosition, setPopupPosition] = useState({
        top: 120,
        left: 420,
    });

    // 현재 캘린더 제목
    const [calendarTitle, setCalendarTitle] = useState('');

    // 현재 캘린더 보기 방식
    const [currentView, setCurrentView] = useState('dayGridMonth');

    // 현재 열려있는 필터 드롭다운
    const [openFilter, setOpenFilter] = useState(null);

    // 일정 범위 필터
    const [scopeFilters, setScopeFilters] = useState({
        my: true,
        department: true,
        company: true,
    });

    // 카테고리 필터
    const [categoryFilters, setCategoryFilters] = useState({
        meeting: true,
        work: true,
        notice: true,
        etc: true,
    });

    // 멤버 일정 필터 - 백엔드 연결 전 더미 데이터
    const [memberFilters, setMemberFilters] = useState([
        { id: 'me', name: '내 일정', checked: true, color: '#0D6EFD' },
        { id: 'song', name: '송창범', checked: true, color: '#20C997' },
        { id: 'cho', name: '조민수', checked: true, color: '#FD7E14' },
        { id: 'kim', name: '김다솜', checked: true, color: '#6F42C1' },
    ]);

    // 캘린더 일정 목록
    // 백엔드 조회 결과를 FullCalendar 형식으로 관리한다.
    const [calendarEvents, setCalendarEvents] = useState([]);

    // 등록 완료 알림
    const [successMessage, setSuccessMessage] = useState('');

    // 캘린더 일정 클릭 시 일정 상세 화면으로 이동
    const handleEventClick = (info) => {
        const scheduleId = info.event.id;

        navigate(`${PATH.CALENDAR.DETAIL}?id=${scheduleId}`);
    };

    // 일정 목록 조회
    // 서버 데이터를 FullCalendar 형식으로 변환한다.
    const fetchScheduleList = async () => {
        try {
            // GET 요청으로 일정 목록 API 호출
            // response.data 에 백엔드가 준 일정 배열이 들어있다.
            const response = await request('GET', '/calendar/list', null);

            // FullCalendar 형식 변환
            // 백엔드 DTO 배열을 캘린더에서 쓰는 event 배열로 바꿈
            const events = response.data.map((schedule) => ({
                id: String(schedule.scheduleId),
                title: schedule.title,
                start: schedule.startTime,
                end: schedule.endTime,
                allDay: schedule.isAllDay,
                extendedProps: {
                    type: schedule.type,
                    category: schedule.category,
                    location: schedule.location,
                    creatorNo: schedule.creatorNo,
                },
            }));

            // 화면에 표시할 일정 state 저장
            setCalendarEvents(events);
        } catch (error) {
            console.error('일정 목록 조회 실패:', error);
        }
    };

    // 첫 화면 조회
    // 페이지가 열릴 때 일정 목록을 한 번 불러온다.
    useEffect(() => {
        fetchScheduleList();
    }, []);

    // 등록 성공 처리
    // 목록을 다시 불러오고 성공 문구 띄움
    const handleCreateSuccess = async () => {
        await fetchScheduleList();
        setSimpleAddVisible(false);
        setSuccessMessage('일정이 등록되었습니다.');

        setTimeout(() => {
            setSuccessMessage('');
        }, 2000);
    };

    // 날짜 숫자 클릭 시 선택 날짜 옆에 간편등록 퀵 팝업 열기
    const handleDateClick = (info) => {
        // 날짜 숫자가 아닌 흰 영역을 클릭한 경우 팝업 열지 않음
        if (!info.jsEvent.target.closest('.calendar-day-number')) {
            return;
        }

        // 클릭한 날짜 저장
        setSelectedDate(info.dateStr);

        // 클릭한 날짜 셀의 화면상 위치 가져오기
        const rect = info.dayEl.getBoundingClientRect();

        // 간편등록 팝업 크기
        const popupWidth = 390;
        const popupHeight = 430;

        // 기본위치 : 클릭한 날짜 셀 오른쪽 아래 근처
        let left = rect.right + 10;
        let top = rect.top + 10;

        // 화면 오른쪽 벗어나면 날짜 셀 왼쪽 표시
        if (left + popupWidth > window.innerWidth) {
            left = rect.left - popupWidth - 10;
        }

        // 화면 아래쪽 벗어나면 위로 보정
        if (top + popupHeight > window.innerHeight) {
            top = window.innerHeight - popupHeight - 30;
        }

        // 아래로 밀리지 않도록 최종 보정
        top = Math.min(top, window.innerHeight - popupHeight - 30);

        // 너무 왼쪽/위쪽으로 붙지 않게 최소값 보정
        if (left < 20) {
            left = 20;
        }

        if (top < 20) {
            top = 20;
        }

        // 팝업 위치 저장
        setPopupPosition({
            top,
            left,
        });

        // 퀵 팝업 열기
        setSimpleAddVisible(true);
    };

    // 일정 범위 필터 체크 변경
    const handleScopeFilterChange = (key) => {
        setScopeFilters((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // 카테고리 필터 체크 변경
    const handleCategoryFilterChange = (key) => {
        setCategoryFilters((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // 멤버 일정 필터 체크 변경
    const handleMemberFilterChange = (id) => {
        setMemberFilters((prev) =>
            prev.map((member) =>
                member.id === id
                    ? { ...member, checked: !member.checked }
                    : member
            )
        );
    };

    // 필터 버튼 클릭 시 드롭다운 열고 닫기
    const handleFilterButtonClick = (filterName) => {
        setOpenFilter((prev) => (prev === filterName ? null : filterName));
    };

    // FullCalendar API 가져오기
    const getCalendarApi = () => {
        return calendarRef.current?.getApi();
    };

    // 이전 달/주/일 이동
    const handlePrevClick = () => {
        const calendarApi = getCalendarApi();

        if (!calendarApi) {
            return;
        }

        calendarApi.prev();
    };

    // 다음 달/주/일 이동
    const handleNextClick = () => {
        const calendarApi = getCalendarApi();

        if (!calendarApi) {
            return;
        }

        calendarApi.next();
    };

    // 오늘로 이동
    const handleTodayClick = () => {
        const calendarApi = getCalendarApi();

        if (!calendarApi) {
            return;
        }

        calendarApi.today();
    };

    // 월/주/일 보기 전환
    const handleViewChange = (viewName) => {
        const calendarApi = getCalendarApi();

        if (!calendarApi) {
            return;
        }

        calendarApi.changeView(viewName);
        setCurrentView(viewName);
    };

    // 캘린더 메인 화면 스타일
    const calendarLayoutStyle = {
        padding: '0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    };

    const calendarToolbarStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '4px',
        flexShrink: 0,
        padding: '8px 12px',
    };

    const calendarToolbarLeftStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        justifyContent: 'flex-start',
    };

    const calendarToolbarRightStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
    };

    const calendarTitleStyle = {
        minWidth: '120px',
        fontSize: '16px',
        fontWeight: '800',
        color: '#ffffff',
        whiteSpace: 'nowrap',
    };

    const filterBarStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        position: 'relative',
    };

    const toolbarButtonStyle = {
        border: '1px solid #dbe3ef',
        borderRadius: '7px',
        backgroundColor: '#fff',
        color: '#212529',
        padding: '5px 9px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        height: '30px',
        lineHeight: '18px',
    };

    const viewButtonStyle = {
        border: '1px solid #dbe3ef',
        backgroundColor: '#fff',
        color: '#212529',
        padding: '5px 9px',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        height: '30px',
    };

    const activeViewButtonStyle = {
        ...viewButtonStyle,
        backgroundColor: '#1f2937',
        color: '#fff',
        borderColor: '#1f2937',
    };

    const filterButtonStyle = {
        border: '1px solid #dbe3ef',
        borderRadius: '999px',
        backgroundColor: '#fff',
        color: '#212529',
        padding: '6px 12px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        height: '30px',
    };

    const filterDropdownStyle = {
        position: 'absolute',
        top: '42px',
        width: '230px',
        padding: '14px',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
        zIndex: 100,
        color: '#212529',
    };

    const filterOptionStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
        fontSize: '14px',
    };

    const memberColorDotStyle = {
        width: '9px',
        height: '9px',
        borderRadius: '50%',
        display: 'inline-block',
    };

    const calendarMainStyle = {
        border: 'none',
        borderRadius: '0',
        padding: '0',
        backgroundColor: '#fff',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
    };

    const pageStyle = {
        width: 'calc(100% + 32px)',
        margin: '-32px -16px 0 -16px',
        padding: '0',
    };

    return (
        <div style={pageStyle}>
            <style>
                {`
                .calendar-main-area .fc-daygrid-day-top {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding-top: 6px;
                }

                .calendar-main-area .fc-daygrid-day-number {
                    width: 100%;
                    text-align: center;
                    padding: 0;
                    text-decoration: none;
                }

                .calendar-main-area .calendar-day-number {
                    display: inline-block;
                    width: 100%;
                    text-align: center;
                    font-size: 15px;
                    font-weight: 600;
                }

                .calendar-main-area .fc-col-header-cell-cushion {
                    display: block;
                    width: 100%;
                    text-align: center;
                    padding: 6px 0;
                    text-decoration: none;
                }
            `}
            </style>

            {successMessage && (
                <div
                    style={{
                        position: 'fixed',
                        top: '90px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#22c55e',
                        color: '#ffffff',
                        padding: '12px 18px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '700',
                        boxShadow: '0 10px 24px rgba(34, 197, 94, 0.28)',
                        zIndex: 2000,
                    }}
                >
                    {successMessage}
                </div>
            )}

            <CCard
                className="mb-0"
                style={{
                    width: '100%',
                    height: 'calc(100vh - 115px)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '0',
                    border: 'none',
                    boxShadow: 'none',
                }}
            >
                <CCardBody
                    className="p-0 d-flex flex-column"
                    style={{
                        flex: 1,
                        minHeight: 0,
                        overflow: 'hidden',
                    }}
                >

                    {/* 캘린더 영역 */}
                    <div style={calendarLayoutStyle}>

                        {/* 캘린더 상단 툴바 영역 */}
                        <div style={calendarToolbarStyle}>
                            {/* 왼쪽: 이동 버튼 + 현재 년월 */}
                            <div style={calendarToolbarLeftStyle}>
                                <button
                                    type="button"
                                    style={toolbarButtonStyle}
                                    onClick={handleTodayClick}
                                >
                                    오늘
                                </button>

                                <button
                                    type="button"
                                    style={toolbarButtonStyle}
                                    onClick={handlePrevClick}
                                >
                                    ‹
                                </button>

                                <button
                                    type="button"
                                    style={toolbarButtonStyle}
                                    onClick={handleNextClick}
                                >
                                    ›
                                </button>

                                <span style={calendarTitleStyle}>
                                    {calendarTitle}
                                </span>
                            </div>

                            {/* 가운데: 필터 버튼 */}
                            <div style={filterBarStyle}>
                                {/* 일정 범위 필터 */}
                                <div style={{ position: 'relative' }}>
                                    <button
                                        type="button"
                                        style={filterButtonStyle}
                                        onClick={() => handleFilterButtonClick('scope')}
                                    >
                                        일정 범위 ▾
                                    </button>

                                    {openFilter === 'scope' && (
                                        <div style={{ ...filterDropdownStyle, left: 0 }}>
                                            <strong style={{ display: 'block', marginBottom: '10px' }}>
                                                일정 범위
                                            </strong>

                                            <label style={filterOptionStyle}>
                                                <input
                                                    type="checkbox"
                                                    checked={scopeFilters.my}
                                                    onChange={() => handleScopeFilterChange('my')}
                                                />
                                                내 일정
                                            </label>

                                            <label style={filterOptionStyle}>
                                                <input
                                                    type="checkbox"
                                                    checked={scopeFilters.department}
                                                    onChange={() => handleScopeFilterChange('department')}
                                                />
                                                같은 부서 일정
                                            </label>

                                            <label style={filterOptionStyle}>
                                                <input
                                                    type="checkbox"
                                                    checked={scopeFilters.company}
                                                    onChange={() => handleScopeFilterChange('company')}
                                                />
                                                전사 일정
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* 카테고리 필터 */}
                                <div style={{ position: 'relative' }}>
                                    <button
                                        type="button"
                                        style={filterButtonStyle}
                                        onClick={() => handleFilterButtonClick('category')}
                                    >
                                        카테고리 ▾
                                    </button>

                                    {openFilter === 'category' && (
                                        <div style={{ ...filterDropdownStyle, left: 0 }}>
                                            <strong style={{ display: 'block', marginBottom: '10px' }}>
                                                카테고리
                                            </strong>

                                            <label style={filterOptionStyle}>
                                                <input
                                                    type="checkbox"
                                                    checked={categoryFilters.meeting}
                                                    onChange={() => handleCategoryFilterChange('meeting')}
                                                />
                                                회의
                                            </label>

                                            <label style={filterOptionStyle}>
                                                <input
                                                    type="checkbox"
                                                    checked={categoryFilters.work}
                                                    onChange={() => handleCategoryFilterChange('work')}
                                                />
                                                업무
                                            </label>

                                            <label style={filterOptionStyle}>
                                                <input
                                                    type="checkbox"
                                                    checked={categoryFilters.notice}
                                                    onChange={() => handleCategoryFilterChange('notice')}
                                                />
                                                공지
                                            </label>

                                            <label style={filterOptionStyle}>
                                                <input
                                                    type="checkbox"
                                                    checked={categoryFilters.etc}
                                                    onChange={() => handleCategoryFilterChange('etc')}
                                                />
                                                기타
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* 멤버 일정 필터 */}
                                <div style={{ position: 'relative' }}>
                                    <button
                                        type="button"
                                        style={filterButtonStyle}
                                        onClick={() => handleFilterButtonClick('member')}
                                    >
                                        멤버 일정 ▾
                                    </button>

                                    {openFilter === 'member' && (
                                        <div style={{ ...filterDropdownStyle, left: 0, width: '260px' }}>
                                            <strong style={{ display: 'block', marginBottom: '10px' }}>
                                                같은 부서 멤버
                                            </strong>

                                            {memberFilters.map((member) => (
                                                <label key={member.id} style={filterOptionStyle}>
                                                    <input
                                                        type="checkbox"
                                                        checked={member.checked}
                                                        onChange={() => handleMemberFilterChange(member.id)}
                                                    />

                                                    <span
                                                        style={{
                                                            ...memberColorDotStyle,
                                                            backgroundColor: member.color,
                                                        }}
                                                    />

                                                    {member.name}
                                                </label>
                                            ))}

                                            <button
                                                type="button"
                                                style={{
                                                    width: '100%',
                                                    marginTop: '10px',
                                                    padding: '8px 10px',
                                                    border: '1px solid #0D6EFD',
                                                    borderRadius: '8px',
                                                    backgroundColor: '#fff',
                                                    color: '#0D6EFD',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => alert('조직도 선택 모달 연결 예정')}
                                            >
                                                조직도에서 멤버 추가
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 오른쪽: 월/주/일 보기 전환 */}
                            <div style={calendarToolbarRightStyle}>
                                <button
                                    type="button"
                                    style={currentView === 'dayGridMonth' ? activeViewButtonStyle : viewButtonStyle}
                                    onClick={() => handleViewChange('dayGridMonth')}
                                >
                                    월
                                </button>

                                <button
                                    type="button"
                                    style={currentView === 'timeGridWeek' ? activeViewButtonStyle : viewButtonStyle}
                                    onClick={() => handleViewChange('timeGridWeek')}
                                >
                                    주
                                </button>

                                <button
                                    type="button"
                                    style={currentView === 'timeGridDay' ? activeViewButtonStyle : viewButtonStyle}
                                    onClick={() => handleViewChange('timeGridDay')}
                                >
                                    일
                                </button>
                            </div>
                        </div>

                        {/* 캘린더 본문 */}
                        <main className="calendar-main-area" style={calendarMainStyle}>
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                locale={koLocale}
                                height="100%"
                                events={calendarEvents}
                                eventClick={handleEventClick}
                                dateClick={handleDateClick}
                                headerToolbar={false}
                                datesSet={(info) => {
                                    setCalendarTitle(info.view.title);
                                    setCurrentView(info.view.type);
                                }}
                                dayCellContent={(arg) => {
                                    return (
                                        <span className="calendar-day-number">
                                            {arg.date.getDate()}
                                        </span>
                                    );
                                }}
                            />
                        </main>
                    </div>
                </CCardBody>
            </CCard>

            {/* 간편등록 퀵 팝업 */}
            <CalendarSimpleAdd
                visible={simpleAddVisible}
                onClose={() => setSimpleAddVisible(false)}
                selectedDateProp={selectedDate}
                popupPosition={popupPosition}
                onCreateSuccess={handleCreateSuccess}
            />
        </div>
    );
};

export default Calendar;