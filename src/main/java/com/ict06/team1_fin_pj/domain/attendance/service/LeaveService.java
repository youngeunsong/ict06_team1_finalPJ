package com.ict06.team1_fin_pj.domain.attendance.service;

import com.ict06.team1_fin_pj.common.dto.attendance.LeaveHistoryDTO;
import com.ict06.team1_fin_pj.common.dto.attendance.LeaveSummaryDTO;

import java.util.List;

// 연차 현황 Service 인터페이스
public interface LeaveService {

    // 1. 총 연차 / 사용 연차 / 잔여 연차 조회
    LeaveSummaryDTO getLeaveSummary(String empNo);

    // 2. 연차 사용 내역 조회
    List<LeaveHistoryDTO> getLeaveHistory(String empNo);

    // ==============================
    // 3. 연차 자동 부여 API
    // ==============================
    // 입사일 기준으로 올해 부여할 연차를 계산하고
    // LEAVE_OCCURRENCE 테이블에 저장한다.
    LeaveSummaryDTO grantAnnualLeave(String empNo);
}