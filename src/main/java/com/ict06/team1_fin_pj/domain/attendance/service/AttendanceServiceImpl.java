package com.ict06.team1_fin_pj.domain.attendance.service;

import com.ict06.team1_fin_pj.common.dto.attendance.AttendanceDTO;
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
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    // ==============================
    // GPS 출근 검증 기준값
    // ==============================

    // 회사 기준 위도 - 테스트용
    // 나중에 실제 회사 위도로 변경
    private static final double COMPANY_LAT = 37.552242359045195;

    // 회사 기준 경도 - 테스트용
    // 나중에 실제 회사 경도로 변경
    private static final double COMPANY_LNG = 126.93744416888119;

    // 출근 허용 반경: 500m
    private static final double ALLOWED_DISTANCE_METER = 500;

    // 출근
    @Override
    public void checkIn(String empNo, Double lat, Double lng) {

        // GPS 값이 없으면 출근 처리 불가
        // 프론트에서 lat, lng가 넘어오지 않으면 여기서 막는다.
        if (lat == null || lng == null) {
            throw new RuntimeException("GPS 위치 정보가 없습니다.");
        }

        // 오늘 날짜
        LocalDate today = LocalDate.now();

        // 1. 중복 출근 방지 (하루 1번)
        if (attendanceRepository.findByEmployee_EmpNoAndWorkDate(empNo, today).isPresent()) {
            throw new RuntimeException("이미 출근했습니다.");
        }

            // 1-1. GPS 위치 검증
            // 회사 위치와 사용자의 현재 위치 사이 거리를 계산한다.
            double distance = calculateDistanceMeter(
                    COMPANY_LAT,
                    COMPANY_LNG,
                    lat,
                    lng
            );

            // 허용 반경보다 멀면 출근을 막는다.
            if (distance > ALLOWED_DISTANCE_METER) {
                throw new RuntimeException(
                        "회사 근처에서만 출근할 수 있습니다. 현재 거리: " + Math.round(distance) + "m"
                );
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

        // 4. Entity 생성 (Builder 사용)
        AttendanceEntity attendance = AttendanceEntity.builder()
                .employee(employee)
                .workDate(today)
                .checkInAt(now)
                .checkInLat(BigDecimal.valueOf(lat))
                .checkInLong(BigDecimal.valueOf(lng))
                .status(status)
                .build();

        // 5. DB 저장
        attendanceRepository.save(attendance);

        }

    // ==============================
    // GPS 거리 계산 메서드
    // ==============================
    // 두 좌표 사이의 거리를 meter 단위로 계산한다.
    // 계산 방식: Haversine 공식
    private double calculateDistanceMeter(double lat1, double lng1, double lat2, double lng2) {

        // 지구 반지름, meter 단위
        final double EARTH_RADIUS = 6371000;

        // 위도 차이를 라디안으로 변환
        double dLat = Math.toRadians(lat2 - lat1);

        // 경도 차이를 라디안으로 변환
        double dLng = Math.toRadians(lng2 - lng1);

        // Haversine 공식 계산
        double a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2)
                        + Math.cos(Math.toRadians(lat1))
                        * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLng / 2)
                        * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // 최종 거리 반환
        return EARTH_RADIUS * c;
    }

    // 내 근태 목록 조회
    @Override
    public List<AttendanceDTO> getMyAttendance(String empNo) {

        // 1. 사번 기준으로 근태 목록 조회
        List<AttendanceEntity> list =
                attendanceRepository.findByEmployee_EmpNo(empNo);

        // 2. Entity를 DTO로 변환해서 반환
        return list.stream()
                .map(att -> AttendanceDTO.builder()
                        .attendanceId(att.getAttendanceId())
                        .empNo(att.getEmployee().getEmpNo())
                        .workDate(att.getWorkDate())
                        .checkInAt(att.getCheckInAt())
                        .checkOutAt(att.getCheckOutAt())
                        .status(att.getStatus().getLabel()) // 문자열 반환(한글)
                        .workHours(att.getWorkHours())
                        .build())
                .toList();
    }

    // 퇴근
    @Override
    public void checkOut(String empNo, Double lat, Double lng) {

        // GPS 값이 없으면 퇴근 처리 불가
        // 프론트에서 lat, lng가 넘어오지 않으면 여기서 막는다.
        if (lat == null || lng == null) {
            throw new RuntimeException("GPS 위치 정보가 없습니다.");
        }

        // 오늘 날짜
        LocalDate today = LocalDate.now();

        // GPS 위치 검증
        double distance = calculateDistanceMeter(
                COMPANY_LAT,
                COMPANY_LNG,
                lat,
                lng
        );

        if (distance > ALLOWED_DISTANCE_METER) {
            throw new RuntimeException(
                    "회사 근처에서만 퇴근할 수 있습니다. 현재 거리: " + Math.round(distance) + "m"
            );
        }

        // 1. 오늘 출근 기록 조회
        AttendanceEntity attendance = attendanceRepository
                .findByEmployee_EmpNoAndWorkDate(empNo, today)
                .orElseThrow(() -> new RuntimeException("출근 기록이 없습니다."));

        // 2. 이미 퇴근했는지 체크
        if (attendance.getCheckOutAt() != null) {
            throw new RuntimeException("이미 퇴근했습니다.");
        }

        // 현재 시간 = 퇴근 시간
        LocalDateTime now = LocalDateTime.now();

        // 3. 근무 시간 계산
        long workMinutes = java.time.Duration
                .between(attendance.getCheckInAt(), now)
                .toMinutes();
        // 분을 시간 단위로 변환
        BigDecimal workHours = BigDecimal.valueOf(workMinutes)
                .divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP);

        // 4. 18:00 기준 조퇴/퇴근 판단
        AttendanceStatus status =
                now.toLocalTime().isBefore(LocalTime.of(18, 0))
                        ? AttendanceStatus.EARLY
                        : AttendanceStatus.LEFT;

        // 5. 연장근무 계산
        int overtimeMins = 0;
        LocalTime standardEndTime = LocalTime.of(18, 0);

        if (now.toLocalTime().isAfter(standardEndTime)) {
            overtimeMins = (int) java.time.Duration
                    .between(standardEndTime, now.toLocalTime())
                    .toMinutes();
        }

        // 6. Entity 값 변경
        attendance.checkOut(
                now,
                BigDecimal.valueOf(lat),
                BigDecimal.valueOf(lng),
                workHours,
                overtimeMins,
                status
        );

        // 7. DB 저장
        attendanceRepository.save(attendance);

    }
}