import React, { useState } from 'react';

const Attendance = () => {

  // 상태 관리
  const [status, setStatus] = useState("출근 전");

  // 출근 버튼 클릭
  const handleCheckIn = () => {
    setStatus("출근 완료");
  };

  // 퇴근 버튼 클릭
  const handleCheckOut = () => {
    setStatus("퇴근 완료");
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>근태관리</h2>

      {/* 오늘 상태 */}
      <div style={{ marginTop: '20px' }}>
        <h3>오늘의 근무 상태</h3>
        <p>{status}</p>

        <button onClick={handleCheckIn}>출근하기</button>
        <button onClick={handleCheckOut} style={{ marginLeft: '10px' }}>
          퇴근하기
        </button>
      </div>

      {/* 월간 요약 */}
      <div style={{ marginTop: '30px' }}>
        <h3>이번 달 근태 요약</h3>
        <p>정상 출근: 0일</p>
        <p>지각: 0일</p>
        <p>조퇴: 0일</p>
      </div>
    </div>
  );
};

export default Attendance;