import React, { useEffect, useState } from 'react';

// CoreUI 
import { CButton, CForm, CFormInput, CFormSelect, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react';

// 페이지 이동
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';

import { PATH } from 'src/constants/path';
import { request } from 'src/helpers/axios_helper';

// [캘린더] 일정 간단 등록 페이지
const CalendarSimpleAdd = ({ visible = true, onClose, selectedDateProp, popupPosition, onCreateSuccess }) => {


    // js 코드로 페이지 이동할 때 사용하는 함수
    const navigate = useNavigate();
    const [userInfo] = useOutletContext();

    // 캘린더에서 선택된 날짜를 URL query string으로 받음
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    // 캘린더에서 날짜를 넘겨주면 그 날짜 사용, 없으면 URL의 ?date= 값 사용
    const selectedDate = selectedDateProp || searchParams.get('date');

    // 퀵 팝업으로 열렸으면 팝업만 닫고,
    // 단독 페이지로 접근한 경우에는 캘린더 메인으로 이동
    const handleClose = () => {
        resetSimpleForm();

        if (onClose) {
            onClose();
        } else {
            navigate(PATH.CALENDAR.ROOT);
        }
    };

    // 선택 날짜가 있으면 현재 시각 기준 다음 정각으로 기본 시간 설정
    const getDefaultDateTime = (dateStr, plusHour = 0) => {
        if (!dateStr) return '';

        const now = new Date();
        const hour = now.getMinutes() === 0 ? now.getHours() : now.getHours() + 1;
        const targetHour = hour + plusHour;

        const formattedHour = String(targetHour).padStart(2, '0');

        return `${dateStr}T${formattedHour}:00`;
    };

    const defaultStart = getDefaultDateTime(selectedDate, 0);
    const defaultEnd = getDefaultDateTime(selectedDate, 1);

    // 퀵 팝업 초기화
    // 닫을 때 이전 입력값을 비운다
    const resetSimpleForm = () => {
        setFormData({
            title: '',
            type: 'PERSONAL',
            category: 'MEETING',
            start: getDefaultDateTime(selectedDate, 0),
            end: getDefaultDateTime(selectedDate, 1),
            location: '',
            content: '',
            participants: [],
        });
        setAllDay(false);
        setErrorMessage('');
        setParticipantModalVisible(false);
    };

    // 간단 등록 폼 입력값 관리
    const [formData, setFormData] = useState({
        title: '',
        type: 'PERSONAL',
        category: 'MEETING',
        start: defaultStart,
        end: defaultEnd,
        location: '',
        content: '',
        participants: [],
    });

    // 참석자 선택 모달 상태
    const [participantModalVisible, setParticipantModalVisible] = useState(false);

    // 종일 여부
    const [allDay, setAllDay] = useState(false);

    // 등록 오류 메세지
    const [errorMessage, setErrorMessage] = useState('');

    // 날짜/종일 상태에 따른 시간 세팅
    useEffect(() => {
        if (!visible || !selectedDate) {
            return;
        }

        setFormData((prev) => ({
            ...prev,
            type: 'PERSONAL',
            start: allDay
                ? `${selectedDate}T00:00`
                : getDefaultDateTime(selectedDate, 0),
            end: allDay
                ? `${selectedDate}T23:59`
                : getDefaultDateTime(selectedDate, 1),
        }));
    }, [visible, selectedDate, allDay]);

    // 참석자 선택 테스트용 같은 부서 구성원 더미 데이터
    const deptMembers = [
        { empId: '20240001', name: '송창범' },
        { empId: '20240002', name: '조민수' },
        { empId: '20240003', name: '김재원' },
    ];

    // 입력값이 변경될 때마다 formData의 해당 항목만 갱신
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // 시작/종료 시간 변경
    const handleTimeChange = (field, timeValue) => {
        const dateValue =
            selectedDate ||
            formData.start?.slice(0, 10) ||
            formData.end?.slice(0, 10);

        if (!dateValue) {
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [field]: `${dateValue}T${timeValue}`,
        }));
    };

    // 참석자 체크박스 선택/해제 시 실행되는 함수
    // 이미 선택된 참석자면 participants 배열에서 제거,
    // 선택되지 않은 참석자면 participants 배열에 추가.
    const handleParticipantChange = (member) => {
        // 현재 클릭한 참석자가 이미 선택된 상태인지 확인
        const isSelected = formData.participants.some(
            (participant) => participant.empId === member.empId
        );

        setFormData({
            ...formData,
            // isSelected가 true면 제거, false면 추가
            participants: isSelected
                ? formData.participants.filter((participant) => participant.empId !== member.empId)
                : [...formData.participants, member],
        });
    };

    // 등록 버튼 클릭 시 현재 입력값을 확인하고 팝업을 닫음
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!formData.title.trim()) {
            setErrorMessage('제목을 입력해 주세요.');
            return;
        }

        if (!userInfo?.empNo) {
            setErrorMessage('로그인 사용자 정보를 확인할 수 없습니다.');
            return;
        }

        const payload = {
            title: formData.title.trim(),
            content: formData.content,
            startTime: formData.start,
            endTime: formData.end,
            type: formData.type,
            creatorNo: userInfo.empNo,
            deptId: null,
            category: formData.category,
            location: formData.location,
            isAllDay: allDay,
            isPublic: true,
            repeatRule: null,
        };

        try {
            await request('POST', '/calendar/create', payload);

            // 등록 성공 처리
            // 입력값을 초기화한 뒤 부모 캘린더에 성공을 알린다.
            resetSimpleForm();

            if (onCreateSuccess) {
                await onCreateSuccess();
            } else {
                handleClose();
            }
        } catch (error) {
            console.error('일정 등록 실패:', error);

            const message = error.response?.data;
            setErrorMessage(
                typeof message === 'string' ? message : '일정 등록에 실패했습니다.'
            );
        }


    };


    // 간편등록 팝업 스타일
    // Calendar.js에서 클릭 위치를 넘겨주면 해당 위치 근처에 띄우고,
    // 위치값이 없으면 화면 중앙 상단 쪽에 임시로 표시한다.
    const simplePopupStyle = {
        position: 'fixed',
        top: popupPosition?.top || 90,
        left: popupPosition?.left || '50%',
        transform: popupPosition ? 'none' : 'translateX(-50%)',
        width: '390px',
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        color: '#111827',
        border: '1px solid #e5e7eb',
        borderRadius: '14px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
        padding: '22px 18px',
        zIndex: 1050,
        animation: 'calendarQuickPopupIn 0.18s ease-out',
    };

    const fieldBlockStyle = {
        marginTop: '14px',
    };

    const compactInputStyle = {
        height: '40px',
        fontSize: '14px',
        backgroundColor: '#ffffff',
        color: '#111827',
        border: '1px solid #d1d5db',
    };

    const titleInputStyle = {
        width: '100%',
        border: 'none',
        borderBottom: '1px solid #d1d5db',
        outline: 'none',
        padding: '10px 0 12px 0',
        fontSize: '16px',
        fontWeight: '700',
        backgroundColor: 'transparent',
        color: '#111827',
        marginBottom: '2px',
    };

    const timeRowStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '14px',
    };

    const timeInputStyle = {
        flex: 1,
        ...compactInputStyle,
        colorScheme: 'light',   // 시간 선택 아이콘이 흰색으로 묻히는 현상 방지
    };
    const helperTextStyle = {
        fontSize: '12px',
        color: '#6b7280',
    };

    return (
        <>
            {/* 퀵 팝업 등장 애니메이션 */}
            <style>
                {`
        @keyframes calendarQuickPopupIn {
            from {
                opacity: 0;
                margin-top: -6px;
            }

            to {
                opacity: 1;
                margin-top: 0;
            }
        }

        /* 시간 선택 아이콘 표시 보정 */
        .calendar-time-input::-webkit-calendar-picker-indicator {
            opacity: 1;
            cursor: pointer;
            filter: invert(35%);
        }
    `}
            </style>

            {/* 일정 간단 등록 퀵 팝업 */}
            {visible && (
                <div style={simplePopupStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <strong>일정 간단 등록</strong>

                        <button
                            type="button"
                            onClick={handleClose}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#9ca3af',
                                fontSize: '20px',
                                cursor: 'pointer',
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <CForm onSubmit={handleSubmit}>
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="제목을 입력하세요"
                            style={titleInputStyle}
                        />

                        {/* 카테고리 */}
                        <CFormSelect
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            style={{ ...fieldBlockStyle, ...compactInputStyle }}
                        >
                            <option value="MEETING">회의</option>
                            <option value="WORK">업무</option>
                            <option value="NOTICE">공지</option>
                        </CFormSelect>

                        {/* 선택 날짜 */}
                        <div style={{ marginTop: '12px', ...helperTextStyle }}>
                            {selectedDate}
                        </div>

                        {/* 시작/종료 시간 */}
                        <div style={timeRowStyle}>
                            <CFormInput
                                className="calendar-time-input"
                                type="time"
                                value={formData.start ? formData.start.slice(11, 16) : ''}
                                onChange={(e) => handleTimeChange('start', e.target.value)}
                                disabled={allDay}
                                style={timeInputStyle}
                            />

                            <span style={{ color: '#6b7280', fontWeight: '600' }}>~</span>

                            <CFormInput
                                className="calendar-time-input"
                                type="time"
                                value={formData.end ? formData.end.slice(11, 16) : ''}
                                onChange={(e) => handleTimeChange('end', e.target.value)}
                                disabled={allDay}
                                style={timeInputStyle}
                            />
                        </div>

                        {/* 종일 */}
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                                id="allDay"
                                type="checkbox"
                                checked={allDay}
                                onChange={(e) => setAllDay(e.target.checked)}
                            />
                            <label htmlFor="allDay" style={{ fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                                종일
                            </label>
                        </div>

                        {/* 장소 */}
                        <CFormInput
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="장소를 입력하세요"
                            style={{ ...fieldBlockStyle, ...compactInputStyle }}
                        />

                        {/* 참석자 */}
                        <div style={{ marginTop: '14px' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                                참석자
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <div style={{ flex: 1, fontSize: '13px', color: '#6b7280' }}>
                                    {formData.participants.length === 0 ? (
                                        <span>선택된 참석자가 없습니다.</span>
                                    ) : (
                                        formData.participants.map((participant) => (
                                            <span key={participant.empId} style={{ marginRight: '8px' }}>
                                                {participant.name}
                                            </span>
                                        ))
                                    )}
                                </div>

                                <CButton
                                    color="primary"
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() => setParticipantModalVisible(true)}
                                >
                                    참석자 선택
                                </CButton>
                            </div>
                        </div>
                        {errorMessage && (
                            <div style={{ marginTop: '12px', color: '#dc3545', fontSize: '13px' }}>
                                {errorMessage}
                            </div>
                        )}
                        {/* 등록/상세등록/취소 버튼 영역 */}
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <CButton
                                color="secondary"
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={handleClose}
                            >
                                취소
                            </CButton>

                            <CButton
                                color="primary"
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => navigate(`${PATH.CALENDAR.DETAIL_ADD}?date=${selectedDate || ''}`)}
                            >
                                상세등록
                            </CButton>

                            <CButton color="primary" size="sm" type="submit">
                                등록
                            </CButton>
                        </div>
                    </CForm>
                </div>
            )}

            {/* 참석자 선택 모달 */}
            <CModal
                visible={participantModalVisible}
                onClose={() => setParticipantModalVisible(false)}
                size="lg"
            >
                <CModalHeader>
                    <CModalTitle>멤버 초대하기</CModalTitle>
                </CModalHeader>

                <CModalBody>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
                        {/* 왼쪽 : 검색/필터 영역, 현재는 화면 확인용 */}
                        <div>
                            <h6>검색 조건</h6>

                            <CFormInput
                                placeholder="멤버 검색"
                                style={{ marginTop: '12px' }}
                            />

                            <CFormSelect style={{ marginTop: '12px' }}>
                                <option>부서 전체</option>
                                <option>개발팀</option>
                                <option>인사팀</option>
                            </CFormSelect>
                        </div>

                        {/* 오른쪽 : 같은 부서 구성원 목록 */}
                        <div>
                            <h6>팀 멤버</h6>

                            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {deptMembers.map((member) => (
                                    <label key={member.empId}>
                                        <input
                                            type="checkbox"
                                            checked={formData.participants.some(
                                                (participant) => participant.empId === member.empId
                                            )}
                                            onChange={() => handleParticipantChange(member)}
                                        />
                                        {' '}
                                        {member.name} ({member.empId})
                                    </label>
                                ))}
                            </div>

                            {/* 선택된 멤버는 아래에 태그 형태로 표시 */}
                            <div style={{ marginTop: '8px' }}>
                                <strong>선택된 멤버 {formData.participants.length}</strong>

                                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {formData.participants.length === 0 ? (
                                        <span style={{ color: '#777' }}>선택된 멤버가 없습니다.</span>
                                    ) : (
                                        formData.participants.map((participant) => (
                                            <span
                                                key={participant.empId}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    backgroundColor: '#0D6EFD',
                                                    color: '#fff',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {participant.name}
                                                <button
                                                    type="button"
                                                    onClick={() => handleParticipantChange(participant)}
                                                    style={{
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: '#fff',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </CModalBody>

                <CModalFooter>
                    <CButton
                        color="secondary"
                        variant="outline"
                        type="button"
                        onClick={() => setParticipantModalVisible(false)}
                    >
                        닫기
                    </CButton>

                    <CButton
                        color="primary"
                        type="button"
                        onClick={() => setParticipantModalVisible(false)}
                    >
                        선택완료
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    );
};

export default CalendarSimpleAdd;