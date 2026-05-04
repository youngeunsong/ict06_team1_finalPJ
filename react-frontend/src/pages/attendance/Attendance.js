import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { CButton, CCard, CCardBody, CCardHeader, CBadge } from '@coreui/react';
import { request } from 'src/helpers/axios_helper';

// 일반 사원용 근태 메인 화면
const Attendance = () => {
  // DefaultLayout에서 전달받은 로그인 사용자 정보
  const [userInfo] = useOutletContext();

  // 로그인한 사용자의 사번
  const empNo = userInfo?.empNo || '20209999';

  // 오늘 출근 상태
  const [todayStatus, setTodayStatus] = useState('출근 전');

  // 출근 시간
  const [checkInTime, setCheckInTime] = useState(null);

  // 퇴근 시간
  const [checkOutTime, setCheckOutTime] = useState(null);

  // GPS 처리 상태 메시지
  // 출근/퇴근 버튼을 눌렀을 때 위치 확인 상태를 화면에 보여주기 위함
  const [gpsMessage, setGpsMessage] = useState('위치 확인 전');

  // 내 근태 목록 저장 (DB에서 가져올 데이터)
  const [attendanceList, setAttendanceList] = useState([]);

  // 조회 보기 모드: day / week / month
  const [viewMode, setViewMode] = useState('month');

  // 출근/퇴근 처리 결과 메시지
  // 성공/실패 내용을 화면에 보여주기 위한 상태값
  const [attendanceMessage, setAttendanceMessage] = useState('');

  // 출근/퇴근 처리 중 여부 (로딩 상태)
  // 버튼 중복 클릭 방지 + UX 개선
  const [loading, setLoading] = useState(false);

  // 현재 날짜
  const today = new Date();

  // 현재 월의 연도와 월
  const year = today.getFullYear();
  const month = today.getMonth();

  // 현재 월의 마지막 날짜
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 1일부터 마지막 날짜까지 배열 생성
  const days = Array.from({ length: lastDate }, (_, i) => i + 1);

  // 오늘 날짜 숫자
  const todayDay = today.getDate();

  // 이번 주 날짜 계산
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d.getDate();
  });

  // 보기 모드에 따라 화면에 보여줄 날짜 결정
  const displayDays =
    viewMode === 'day'
      ? [todayDay]
      : viewMode === 'week'
        ? weekDays
        : days;

  // 근태 목록을 다시 조회하는 함수
  // 처음 화면 들어왔을 때도 사용하고,
  // 출근/퇴근 성공 후 화면 갱신할 때도 다시 사용할 함수
  const fetchAttendance = async () => {
    try {
      // 백엔드에서 내 근태 목록 조회
      // const res = await axios.get('http://localhost:8081/api/attendance/my', {
      //   params: {
      //     empNo: empNo, 
      //   },
      // });
      const params = {empNo}; 
      const res = await request('GET', '/attendance/my', params);

      console.log('근태 조회 결과:', res.data);

      // 1. 캘린더에 보여줄 근태 목록 저장
      setAttendanceList(res.data);

      // 2. 오늘 날짜 만들기
      const todayDate = new Date().toLocaleDateString('en-CA');

      // 3. 근태 목록 중 오늘 날짜 데이터 찾기
      const todayData = res.data.find((item) => item.workDate === todayDate);

      // 4. 오늘 데이터가 있으면 오늘 카드에 반영
      if (todayData) {
        // 상태 반영
        setTodayStatus(todayData.status);

        // 출근 시간이 있으면 HH:mm 형태로 잘라서 저장
        setCheckInTime(
          todayData.checkInAt ? todayData.checkInAt.substring(11, 16) : null
        );

        // 퇴근 시간이 있으면 HH:mm 형태로 잘라서 저장
        setCheckOutTime(
          todayData.checkOutAt ? todayData.checkOutAt.substring(11, 16) : null
        );
      } else {
        // 오늘 데이터가 없으면 출근 전 상태로 초기화
        setTodayStatus('출근 전');
        setCheckInTime(null);
        setCheckOutTime(null);
      }
    } catch (err) {
      console.error(err);
      alert('근태 조회 중 오류가 발생했습니다.');
    }
  };

  // 화면이 처음 열릴 때 근태 목록 조회
  useEffect(() => {
    fetchAttendance();
  }, []);

  // 시간 포맷
  const getNowTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 출근 버튼 클릭
  const handleCheckIn = () => {

    // 이미 처리 중이면 실행 막기
    if (loading) return;

    // 1. 사용자 확인
    const isConfirm = window.confirm('출근 처리하시겠습니까?');
    if (!isConfirm) return;

    // 로딩 시작
    setLoading(true);

    // 2. 브라우저 GPS 요청
    if (!navigator.geolocation) {
      alert('GPS를 지원하지 않는 브라우저입니다.');

      setLoading(false); 
    }

    // GPS 요청 시작 상태 표시
    setGpsMessage('위치 확인 중입니다...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // 3. 현재 위치 가져오기
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log('현재 위치:', lat, lng);

          // GPS 성공 메시지
          setGpsMessage('GPS 확인 완료');

          // 4. 백엔드 출근 API 호출
          // await axios.post('http://localhost:8081/api/attendance/check-in', null, {
          //   params: {
          //     empNo: empNo,
          //     lat: lat,
          //     lng: lng,
          //   }
          // });
          const params = {
            empNo: empNo,
            lat: lat,
            lng: lng,
          }
          await request('POST', '/attendance/check-in', params);


          // 성공 메시지
          setAttendanceMessage('출근 처리가 완료되었습니다.');

          // 데이터 다시 조회
          await fetchAttendance();

        } catch (error) {
          console.error(error);

          // 실패 메시지
          setAttendanceMessage(
            error.response?.data?.message || '출근 처리에 실패했습니다.'
          );

        } finally {
          // 무조건 실행 (성공/실패 둘 다)
          setLoading(false);
        }
      },

      // GPS 실패 시
      (error) => {
        console.error(error);

        setGpsMessage('위치 정보를 가져올 수 없습니다.');
        setAttendanceMessage('GPS 위치를 가져올 수 없습니다.');

        setLoading(false); 
      }
    );
  };

  // 퇴근 버튼 클릭
  const handleCheckOut = () => {

    // 이미 처리 중이면 실행 막기
    if (loading) return;

    const isConfirm = window.confirm('퇴근 처리하시겠습니까?');
    if (!isConfirm) return;

    // 로딩 시작
    setLoading(true);

    if (!navigator.geolocation) {
      alert('GPS를 지원하지 않는 브라우저입니다.');

      setLoading(false); 
      return;
    }

    setGpsMessage('위치 확인 중입니다...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log('퇴근 위치:', lat, lng);

          // GPS 성공
          setGpsMessage('GPS 확인 완료');

          // await axios.post('http://localhost:8081/api/attendance/check-out', null, {
          //   params: {
          //     empNo: empNo,
          //     lat: lat,
          //     lng: lng,
          //   }
          // });
          const params = {
              empNo: empNo,
              lat: lat,
              lng: lng,
          }
          await request('POST', '/attendance/check-out', params);

          // 성공 메시지
          setAttendanceMessage('퇴근 처리가 완료되었습니다.');

          await fetchAttendance();

        } catch (error) {
          console.error(error);

          setAttendanceMessage(
            error.response?.data?.message || '퇴근 처리에 실패했습니다.'
          );

        } finally {
          // 반드시 필요
          setLoading(false);
        }
      },

      // GPS 실패
      (error) => {
        console.error(error);

        setGpsMessage('위치 정보를 가져올 수 없습니다.');
        setAttendanceMessage('GPS 위치를 가져올 수 없습니다.');

        setLoading(false); 
      }
    );
  };

  // 상태 뱃지 색상
  const getBadgeColor = (status) => {
    if (status === 'ON_TIME' || status === '정상출근') return 'success';
    if (status === 'LATE' || status === '지각') return 'warning';
    if (status === 'EARLY' || status === '조퇴') return 'danger';
    if (status === 'LEFT' || status === '퇴근') return 'primary';
    return 'secondary';
  };

  // 상태 한글 표시
  const getStatusText = (status) => {
    // DB에서 영어 Enum 코드가 올 경우
    if (status === 'ON_TIME') return '정상출근';
    if (status === 'LATE') return '지각';
    if (status === 'EARLY') return '조퇴';
    if (status === 'LEFT') return '퇴근완료';

    // DB에서 이미 한글 label이 올 경우
    if (status === '정상출근') return '정상출근';
    if (status === '지각') return '지각';
    if (status === '조퇴') return '조퇴';
    if (status === '퇴근') return '퇴근완료';

    // 오늘 기록이 없을 때만 출근 전
    return '출근 전';
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 className="mb-4"> {userInfo?.name || '테스트'}</h2>
      
      {/* 오늘 출퇴근 카드 */}
      <CCard className="mb-4">
        <CCardHeader>
          <strong>오늘의 근무 상태</strong>
        </CCardHeader>

        <CCardBody>
          <h5>
            상태:{' '}
            <CBadge color={getBadgeColor(todayStatus)}>
              {getStatusText(todayStatus)}
            </CBadge>
          </h5>

          <p className="mt-3">출근 시간: {checkInTime || '-'}</p>
          <p>퇴근 시간: {checkOutTime || '-'}</p>

          {/* GPS 상태 표시 */}
          <p style={{ fontSize: '13px', color: '#6c757d' }}>
            GPS 상태: {gpsMessage}
          </p>

          {/* 출근/퇴근 처리 결과 메시지 */}
          {attendanceMessage && (
            <div
              className="mt-2"
              style={{
                fontSize: '13px',
                color: attendanceMessage.includes('완료') ? '#198754' : '#dc3545',
              }}
            >
              {attendanceMessage}
            </div>
          )}

          <CButton
            color="primary"
            variant="outline"
            onClick={handleCheckIn}
            disabled={checkInTime !== null || loading}  // 출근 시간이 있으면 이미 출근한 것 → 출근 버튼 비활성화
          >
            {loading ? '처리중...' : '출근하기'}
          </CButton>

          <CButton
            color="success"
            variant="outline"
            className="ms-2"
            onClick={handleCheckOut}
            disabled={checkInTime === null || checkOutTime !== null || loading}  // 출근 시간이 없으면 퇴근 불가, 퇴근 시간이 있으면 다시 퇴근 불가
          >
            {loading ? '처리중...' : '퇴근하기'}
          </CButton>
          
          {/* 안내 문구 */}
          <div className="mt-2" style={{ fontSize: '13px', color: '#6c757d' }}>
            {checkInTime === null && '아직 출근 전입니다. 출근 버튼을 눌러 출근을 등록하세요.'}
            {checkInTime !== null && checkOutTime === null && '출근이 등록되었습니다. 퇴근 시 퇴근 버튼을 눌러주세요.'}
            {checkInTime !== null && checkOutTime !== null && '오늘의 출퇴근 처리가 완료되었습니다.'}
          </div>
        </CCardBody>
      </CCard>

      {/* 월간 캘린더 */}
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>
            {viewMode === 'day' && '오늘 근태'}
            {viewMode === 'week' && '이번 주 근태'}
            {viewMode === 'month' && `${year}년 ${month + 1}월 근태 캘린더`}
          </strong>

          <div>
            <CButton
              size="sm"
              color={viewMode === 'day' ? 'primary' : 'secondary'}
              variant={viewMode === 'day' ? undefined : 'outline'}
              onClick={() => setViewMode('day')}
            >
              일
            </CButton>

            <CButton
              size="sm"
              className="ms-2"
              color={viewMode === 'week' ? 'primary' : 'secondary'}
              variant={viewMode === 'week' ? undefined : 'outline'}
              onClick={() => setViewMode('week')}
            >
              주
            </CButton>

            <CButton
              size="sm"
              className="ms-2"
              color={viewMode === 'month' ? 'primary' : 'secondary'}
              variant={viewMode === 'month' ? undefined : 'outline'}
              onClick={() => setViewMode('month')}
            >
              월
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '10px',
            }}
          >
            {displayDays.map((day) => {
                const isToday = day === today.getDate();

                // 현재 반복 중인 날짜를 YYYY-MM-DD 형식으로 만들기
                const currentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                
                // DB에서 가져온 근태 목록 중 현재 날짜와 같은 데이터 찾기
                // find() = 조건에 맞는 "첫 번째 데이터 1개"만 가져옴
                const attendance = attendanceList.find((item) => item.workDate === currentDate);

              return (
                <div
                  key={day}
                  style={{
                    minHeight: '110px',
                    border: isToday ? '2px solid #321fdb' : '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '10px',
                    backgroundColor: isToday ? '#f3f5ff' : '#fff',
                  }}
                >
                  <strong>{day}일</strong>

                  {/* 해당 날짜에 근태 데이터가 있을 때만 화면에 출력 */}
                  {attendance && (
                    <div className="mt-2">
                      
                       {/* 상태 표시 (지각 / 정상출근 등) */}
                      <CBadge color={getBadgeColor(attendance.status)}>
                        {attendance.status}
                      </CBadge>

                       {/* 출근 시간 표시 
                           시:분만 잘라오기
                           index 형태를 문자열.substring(시작, 끝)(포함, 미포함) */}
                      <div style={{ fontSize: '13px', marginTop: '8px' }}>
                        출근: {attendance.checkInAt ? attendance.checkInAt.substring(11, 16) : '-'}
                      </div>
                      {/* 퇴근 시간 표시 */}
                      <div style={{ fontSize: '13px' }}>
                        퇴근: {attendance.checkOutAt ? attendance.checkOutAt.substring(11, 16) : '-'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default Attendance;