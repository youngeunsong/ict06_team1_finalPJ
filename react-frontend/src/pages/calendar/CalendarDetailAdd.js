import React, { useState } from 'react';

// CoreUI 
import { CButton, CCard, CCardBody, CCardHeader, CForm, CFormInput, CFormSelect, CFormTextarea, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react';

// 페이지 이동
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';

// 페이지 전체 레이아웃 스타일
import { containerStyle } from 'src/styles/js/demoPageStyle';

// 경로 상수
import { PATH } from 'src/constants/path';

// [캘린더] 상세 등록 / 반복 / 참석자 일정 페이지
const CalendarDetailAdd = () => {

    // DefaultLayout.js의 Outlet에서 보낸 userInfo 데이터 받기
    const [userInfo] = useOutletContext();

    // js 코드로 페이지 이동할 때 사용하는 함수
    const navigate = useNavigate();

    // 캘린더에서 선택한 날짜를 URL query string으로 받음
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const selectedDate = searchParams.get('date');

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

    // 상세 등록 폼 입력값 관리
    const [formData, setFormData] = useState({
        title: '',
        type: 'PERSONAL',
        category: 'MEETING',
        start: defaultStart,
        end: defaultEnd,
        location: '',
        content: '',
        participants: [],
        repeatYn: 'N',
        repeatRule: '',
        visibility: 'PRIVATE',
    });

    // 참석자 선택 모달 열림/닫힘 상태 관리
    const [participantModalVisible, setParticipantModalVisible] = useState(false);

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

    // 참석자 선택 토글 처리: 선택된 사람은 제거, 선택 안 된 사람은 추가
    const handleParticipantChange = (member) => {
        const isSelected = formData.participants.some(
            (participant) => participant.empId === member.empId
        );

        setFormData({
            ...formData,
            participants: isSelected
                ? formData.participants.filter((participant) => participant.empId !== member.empId)
                : [...formData.participants, member],
        });
    };

    // 상세 등록 버튼 클릭 시 입력값 확인 후 캘린더 메인 이동
    const handleSubmit = (e) => {
        e.preventDefault();

        console.log('상세 등록 데이터:', formData);
        alert('상세 일정이 등록되었습니다.');

        navigate(PATH.CALENDAR.ROOT);
    };

    return (
        <div style={containerStyle}>
            {/* 일정 상세 등록 영역 */}
            <CCard className="mb-4" style={{ height: 'calc(100vh - 120px)' }}>
                <CCardHeader>
                    <strong>일정 상세 등록</strong>
                </CCardHeader>
                <CCardBody className="p-0 d-flex flex-column">
                    {/* 일정 상세 등록 폼 영역 */}
                    <div style={{ padding: '20px' }}>
                        <h4>일정 상세 등록</h4>

                        <CForm onSubmit={handleSubmit}>
                            <CFormInput
                                label="일정 제목"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="일정 제목을 입력하세요"
                            />

                            {/* 상세등록에서는 일정 구분을 선택 가능 */}
                            <CFormSelect
                                label="일정 구분"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                style={{ marginTop: '16px' }}
                            >
                                <option value="PERSONAL">개인일정</option>
                                <option value="DEPARTMENT">부서일정</option>
                                <option value="COMPANY">전사일정</option>
                            </CFormSelect>

                            <CFormSelect
                                label="카테고리"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={{ marginTop: '16px' }}
                            >
                                <option value="MEETING">회의</option>
                                <option value="WORK">업무</option>
                                <option value="NOTICE">공지</option>
                                <option value="EDUCATION">교육</option>
                                <option value="ETC">기타</option>
                            </CFormSelect>

                            {/* 시작/종료일시는 선택 날짜가 있으면 기본값이 자동 세팅됨 */}
                            <CFormInput
                                type="datetime-local"
                                label="시작일시"
                                name="start"
                                value={formData.start}
                                onChange={handleChange}
                                style={{ marginTop: '16px' }}
                            />

                            <CFormInput
                                type="datetime-local"
                                label="종료일시"
                                name="end"
                                value={formData.end}
                                onChange={handleChange}
                                style={{ marginTop: '16px' }}
                            />

                            {/* 장소와 내용은 상세등록에서도 기본 일정 정보로 입력 */}
                            <CFormInput
                                label="장소"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="장소를 입력하세요"
                                style={{ marginTop: '16px' }}
                            />

                            {/* 참석자는 직접 입력하지 않고 모달에서 선택 */}
                            <div style={{ marginTop: '16px' }}>
                                <strong>참석자</strong>

                                {/* 선택된 참석자가 있으면 이름을 표시하고, 없으면 안내문구 표시 */}
                                <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                                    {formData.participants.length === 0 ? (
                                        <span style={{ color: '#777' }}>선택된 참석자가 없습니다.</span>
                                    ) : (
                                        formData.participants.map((participant) => (
                                            <span key={participant.empId} style={{ marginRight: '8px' }}>
                                                {participant.name}
                                            </span>
                                        ))
                                    )}
                                </div>

                                {/* 버튼 클릭시 참석자 선택 모달 열기 */}
                                <CButton
                                    color="primary"
                                    variant="outline"
                                    type="button"
                                    onClick={() => setParticipantModalVisible(true)}
                                >
                                    참석자 선택
                                </CButton>
                            </div>

                            <CFormTextarea
                                label="내용"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="일정 내용을 입력하세요"
                                rows={4}
                                style={{ marginTop: '16px' }}
                            />

                            {/* 상세등록 확장 항목: 반복 여부, 반복 규칙, 공개 범위 */}
                            <CFormSelect
                                label="반복 여부"
                                name="repeatYn"
                                value={formData.repeatYn}
                                onChange={handleChange}
                                style={{ marginTop: '16px' }}
                            >
                                <option value="N">반복 없음</option>
                                <option value="Y">반복 사용</option>
                            </CFormSelect>

                            <CFormSelect
                                label="반복 규칙"
                                name="repeatRule"
                                value={formData.repeatRule}
                                onChange={handleChange}
                                style={{ marginTop: '16px' }}
                            >
                                <option value="">반복 없음</option>
                                <option value="DAILY">매일</option>
                                <option value="WEEKLY">매주</option>
                                <option value="MONTHLY">매월</option>
                            </CFormSelect>

                            <CFormSelect
                                label="공개 범위"
                                name="visibility"
                                value={formData.visibility}
                                onChange={handleChange}
                                style={{ marginTop: '16px' }}
                            >
                                <option value="PRIVATE">비공개</option>
                                <option value="DEPARTMENT">부서 공개</option>
                                <option value="COMPANY">전사 공개</option>
                            </CFormSelect>

                            {/* 취소/등록 버튼 영역 */}
                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <CButton
                                    color="secondary"
                                    variant="outline"
                                    type="button"
                                    onClick={() => navigate(PATH.CALENDAR.ROOT)}
                                >
                                    취소
                                </CButton>

                                <CButton color="primary" type="submit">
                                    등록
                                </CButton>
                            </div>
                        </CForm>
                    </div>
                </CCardBody>
            </CCard>

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
                            <div style={{ marginTop: '16px' }}>
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

                    {/* 선택은 체크박스 클릭 시 바로 반영되고, 선택완료는 모달만 닫음 */}
                    <CButton
                        color="primary"
                        type="button"
                        onClick={() => setParticipantModalVisible(false)}
                    >
                        선택완료
                    </CButton>
                </CModalFooter>
            </CModal>
        </div>
    );
};

export default CalendarDetailAdd;