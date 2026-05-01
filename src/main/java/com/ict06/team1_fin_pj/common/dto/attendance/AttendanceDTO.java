package com.ict06.team1_fin_pj.common.dto.attendance;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

// DTO: 프론트에 전달할 데이터 구조
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceDTO {

    // 근태 ID
    private Integer attendanceId;

    // 사번 (Entity 대신 문자열로 전달)
    private String empNo;

    // 근무 날짜
    private LocalDate workDate;

    // 출근 시간
    private LocalDateTime checkInAt;

    // 퇴근 시간
    private LocalDateTime checkOutAt;

    // 근무 상태 (정상출근, 지각 등)
    private String status;

    // 근무 시간
    private BigDecimal workHours;
}