package com.ict06.team1_fin_pj.domain.attendance.controller;

import com.ict06.team1_fin_pj.common.dto.attendance.LeaveHistoryDTO;
import com.ict06.team1_fin_pj.common.dto.attendance.LeaveSummaryDTO;
import com.ict06.team1_fin_pj.domain.attendance.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// 연차 현황 API 컨트롤러
@RestController
@RequiredArgsConstructor
@RequestMapping("/leave")
public class LeaveController {

    // 연차 비즈니스 로직 담당 Service
    private final LeaveService leaveService;

    // ==============================
    // 1. 연차 요약 조회 API
    // ==============================
    // 예시 요청:
    // GET /api/leave/summary?empNo=20209999
    //
    // 응답 예시:
    // {
    //   "totalDays": 15,
    //   "usedDays": 5.5,
    //   "remainDays": 9.5
    // }
    @GetMapping("/summary")
    public LeaveSummaryDTO getLeaveSummary(@RequestParam String empNo) {
        return leaveService.getLeaveSummary(empNo);
    }

    // ==============================
    // 2. 연차 사용 내역 조회 API
    // ==============================
    // 예시 요청:
    // GET /api/leave/history?empNo=20209999
    //
    // 응답 예시:
    // [
    //   {
    //     "startDate": "2026-05-01",
    //     "endDate": "2026-05-01",
    //     "typeName": "연차",
    //     "leaveDays": 1,
    //     "status": "APPROVED"
    //   }
    // ]
    @GetMapping("/history")
    public List<LeaveHistoryDTO> getLeaveHistory(@RequestParam String empNo) {
        return leaveService.getLeaveHistory(empNo);
    }

    // ==============================
    // 3. 연차 자동 부여 API
    // ==============================
    // 요청 예시:
    // POST /api/leave/grant?empNo=20209999
    //
    // 역할:
    // 1. 사원의 입사일을 기준으로 올해 부여할 연차를 계산
    // 2. LEAVE_OCCURRENCE 테이블에 저장
    // 3. 저장 후 총/사용/잔여 연차 요약 반환
    @PostMapping("/grant")
    public LeaveSummaryDTO grantAnnualLeave(@RequestBody Map<String, Object> body) {
        String empNo = (String) body.get("empNo");
        return leaveService.grantAnnualLeave(empNo);
    }
}