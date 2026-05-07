package com.ict06.team1_fin_pj.common.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

// 연차 요약 응답 DTO
@Getter
@AllArgsConstructor
public class LeaveSummaryDTO {

    // 총 연차
    private BigDecimal totalDays;

    // 사용 연차
    private BigDecimal usedDays;

    // 잔여 연차
    private BigDecimal remainDays;
}