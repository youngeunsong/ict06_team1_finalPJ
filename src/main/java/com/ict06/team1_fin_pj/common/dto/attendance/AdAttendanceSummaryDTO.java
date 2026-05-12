package com.ict06.team1_fin_pj.common.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 관리자 근태 현황 상단 요약 카드 DTO
 *
 * 역할:
 * - 전체 근태 건수
 * - 정상 출근 수
 * - 지각 수
 * - 조퇴 수
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdAttendanceSummaryDTO {

    // 전체 근태 건수
    private int totalCount;

    // 정상 출근 수
    private int onTimeCount;

    // 지각 수
    private int lateCount;

    // 조퇴 수
    private int earlyCount;
}