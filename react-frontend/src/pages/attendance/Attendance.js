import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { CButton, CCard, CCardBody, CCardHeader, CBadge } from '@coreui/react';

// 일반 사원용 근태 메인 화면
const Attendance = () => {
  // DefaultLayout에서 전달받은 로그인 사용자 정보
  const [userInfo] = useOutletContext();

  // 오늘 출근 상태
  const [todayStatus, setTodayStatus] = useState('출근 전');

  // 출근 시간
  const [checkInTime, setCheckInTime] = useState(null);

  // 퇴근 시간
  const [checkOutTime, setCheckOutTime] = useState(null);

  // 내 근태 목록 저장 (DB에서 가져올 데이터)
  const [attendanceList, setAttendanceList] = useState([]);

  // 현재 날짜
  const today = new Date();

  // 현재 월의 연도와 월
  const year = today.getFullYear();
  const month = today.getMonth();

  // 현재 월의 마지막 날짜
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 1일부터 마지막 날짜까지 배열 생성
  const days = Array.from({ length: lastDate }, (_, i) => i + 1);

  // 근태 조회 (테스트용 - 하드코딩)
  useEffect(() => {

    axios.get('http://localhost:8081/api/attendance/my', {
      params: {
        empNo: '20209999'
      },
    })
    .then((res) => {
      console.log(' 근태 조회 결과:', res.data);

      setAttendanceList(res.data);

      // 오늘 날짜 문자열 만들기
      const todayDate = new Date().toLocaleDateString('en-CA');

      // 오늘 데이터 찾기
      const todayData = res.data.find(item => item.workDate === todayDate);

      if (todayData) {
        // 상태 자동 반영
        setTodayStatus(todayData.status);

        // 출근 시간 반영
        if (todayData.checkInAt) {
          setCheckInTime(todayData.checkInAt.substring(11, 16));
        }

        // 퇴근 시간 반영
        if (todayData.checkOutAt) {
          setCheckOutTime(todayData.checkOutAt.substring(11, 16));
        }
      }

    })
    .catch((err) => {
      console.error(err);
    });

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

    // 1. 사용자 확인
    const isConfirm = window.confirm('출근 처리하시겠습니까?');
    if (!isConfirm) return;

    // 2. 브라우저 GPS 요청
    if (!navigator.geolocation) {
      alert('GPS를 지원하지 않는 브라우저입니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // 3. 현재 위치 가져오기
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log('현재 위치:', lat, lng);

          // 4. 백엔드 출근 API 호출
          await axios.post('http://localhost:8081/api/attendance/check-in', null, {
            params: {
              empNo: '20209999',
              lat: lat,
              lng: lng,
            }
          });

          alert('출근 완료');

          // 5. 화면 갱신
          window.location.reload();

        } catch (error) {
          console.error(error);
          alert(error.response?.data?.message || '출근 실패');
        }
      },

      // 6. GPS 실패 시
      (error) => {
        console.error(error);
        alert('위치 정보를 가져올 수 없습니다.');
      }
    );
  };

  // 퇴근 버튼 클릭
  const handleCheckOut = () => {

    // 1. 사용자 확인
    const isConfirm = window.confirm('퇴근 처리하시겠습니까?');
    if (!isConfirm) return;

    // 2. GPS 지원 체크
    if (!navigator.geolocation) {
      alert('GPS를 지원하지 않는 브라우저입니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // 3. 현재 위치
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log('📍 퇴근 위치:', lat, lng);

          // 4. 백엔드 퇴근 API 호출
          await axios.post('http://localhost:8081/api/attendance/check-out', null, {
            params: {
              empNo: '20209999',
              lat: lat,
              lng: lng,
            }
          });

          alert('퇴근 완료');

          // 5. 화면 갱신
          window.location.reload();

        } catch (error) {
          console.error(error);
          alert(error.response?.data?.message || '퇴근 실패');
        }
      },

      // GPS 실패
      (error) => {
        console.error(error);
        alert('위치 정보를 가져올 수 없습니다.');
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
      <h2 className="mb-4"> {userInfo?.name}님의 근태 현황</h2>
      
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

          <CButton
            color="primary"
            variant="outline"
            onClick={handleCheckIn}
            disabled={todayStatus !== '출근 전'}
          >
            출근하기
          </CButton>

          <CButton
            color="success"
            variant="outline"
            className="ms-2"
            onClick={handleCheckOut}
            disabled={todayStatus === '출근 전' || checkOutTime !== null}
          >
            퇴근하기
          </CButton>
        </CCardBody>
      </CCard>

      {/* 월간 캘린더 */}
      <CCard>
        <CCardHeader>
          <strong>{year}년 {month + 1}월 근태 캘린더</strong>
        </CCardHeader>

        <CCardBody>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '10px',
            }}
          >
            {days.map((day) => {
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