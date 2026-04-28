package com.ict06.team1_fin_pj.domain.attendance.controller;

import com.ict06.team1_fin_pj.domain.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    // 🔥 출근 API
    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(
            @RequestParam Double lat,
            @RequestParam Double lng
    ) {

        // ⚠️ 현재는 테스트용 (나중에 로그인 사용자로 변경)
        String empNo = "20240001";

        attendanceService.checkIn(empNo, lat, lng);

        return ResponseEntity.ok("출근 완료");
    }
}