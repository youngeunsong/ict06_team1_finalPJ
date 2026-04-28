package com.ict06.team1_fin_pj.domain.attendance.service;

import com.ict06.team1_fin_pj.domain.attendance.entity.AttendanceEntity;
import com.ict06.team1_fin_pj.domain.attendance.entity.AttendanceStatus;
import com.ict06.team1_fin_pj.domain.attendance.repository.AttendanceRepository;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.domain.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public void checkIn(String empNo, Double lat, Double lng) {

        // 오늘 날짜
        LocalDate today = LocalDate.now();

        // 1. 중복 출근 방지 (하루 1번)
        if (attendanceRepository.findByEmployee_EmpNoAndWorkDate(empNo, today).isPresent()) {
            throw new RuntimeException("이미 출근했습니다.");
        }

        // 2. 사원 조회 (FK 연결용)
        EmpEntity employee = employeeRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new RuntimeException("사원을 찾을 수 없습니다."));

        // 현재 시간
        LocalDateTime now = LocalDateTime.now();

        // 3. 지각 여부 판단 (09:00 기준)
        AttendanceStatus status =
                now.toLocalTime().isAfter(LocalTime.of(9, 0))
                        ? AttendanceStatus.LATE
                        : AttendanceStatus.ON_TIME;

        // 🔥 4. Entity 생성 (Builder 사용)
        AttendanceEntity attendance = AttendanceEntity.builder()
                .employee(employee)
                .workDate(today)
                .checkInAt(now)
                .checkInLat(BigDecimal.valueOf(lat))
                .checkInLong(BigDecimal.valueOf(lng))
                .status(status)
                .build();

        // 🔥 5. DB 저장
        attendanceRepository.save(attendance);
    }
}