import React, { useState } from 'react';
// 페이지 링크 이동
import { Link } from 'react-router-dom';

// 시연용 이미지 파일
import demo_image from '../../assets/images/first_demo/근태관리(한달 보기).png';
import demo_image_weekly from '../../assets/images/first_demo/근태관리(주별 보기).png';

// 코드 하이라이터 : sql 코드 보여주는 용
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; 
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// 근태관리 화면
const AttendanceManagement = () => {

    // 핵심 SQL 
    const sql = `
    -- 출근 등록: 사용자의 설정 시간과 비교하여 지각 여부 자동 입력
    INSERT INTO attendance (user_id, check_in, ip_address, status)
    VALUES (
        #{userId}, 
        CURRENT_TIMESTAMP, 
        #{ipAddress},
        CASE 
            WHEN CURRENT_TIME > (SELECT start_time FROM work_types WHERE type_id = #{typeId}) THEN 'LATE'
            ELSE 'NORMAL'
        END
    )
    RETURNING att_id;

    -- 퇴근 등록 및 총 근무 시간(초단위) 계산 후 업데이트
    UPDATE attendance 
    SET 
        check_out = CURRENT_TIMESTAMP,
        daily_work_time = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - check_in)) / 3600, -- 시간 단위 계산
        status = CASE 
                    WHEN status = 'LATE' THEN 'LATE' -- 지각은 유지
                    WHEN CURRENT_TIME < '18:00:00'::TIME THEN 'EARLY_LEAVE' -- 조퇴 판단
                    ELSE 'NORMAL'
                END
    WHERE user_id = #{userId} AND check_out IS NULL;
    `; 

    // 1. 이미지 경로를 상태로 관리
    const [imgSrc, setImgSrc] = useState(demo_image); 

    const changeImage = () => {
        // 2. 버튼 클릭 시 다른 이미지로 변경
        setImgSrc(imgSrc === demo_image ? demo_image_weekly : demo_image);
    }

    return (
        <div>
            {/* 버튼 클릭하여 뷰 전환 */}
            <button onClick={changeImage}>월간/주별 보기</button>    

            {/* 버튼 클릭하여 페이지 이동 */}
            <Link to="/attendance/stats">
                <button> 근태통계 </button>
            </Link>

            {/* 화면 설계 이미지 */}
            <img src={imgSrc} alt="attendance"/>
            <br />
            

            {/* 핵심 SQL */}
            <SyntaxHighlighter language='sql' style={atomDark}>
                {sql}
            </SyntaxHighlighter>
        </div>
    );
};

export default AttendanceManagement;