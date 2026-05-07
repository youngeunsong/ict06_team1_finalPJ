package com.ict06.team1_fin_pj.common.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

// 연차 사용 내역 응답 DTO
@Getter
@AllArgsConstructor
public class LeaveHistoryDTO {

    private LocalDate startDate;

    private LocalDate endDate;

    private String typeName;

    private BigDecimal leaveDays;

    private String status;
}