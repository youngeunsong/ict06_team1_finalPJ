package com.ict06.team1_fin_pj.domain.attendance.service;

import com.ict06.team1_fin_pj.domain.attendance.entity.LeaveOccurrenceEntity;
import com.ict06.team1_fin_pj.domain.attendance.entity.LeaveRequestEntity;
import com.ict06.team1_fin_pj.domain.attendance.repository.LeaveOccurrenceRepository;
import com.ict06.team1_fin_pj.domain.attendance.repository.LeaveRequestRepository;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.domain.employee.repository.EmployeeRepository;
import com.ict06.team1_fin_pj.domain.attendance.repository.LeaveTypeRepository;
import com.ict06.team1_fin_pj.domain.attendance.entity.LeaveTypeEntity;

import com.ict06.team1_fin_pj.common.dto.attendance.LeaveHistoryDTO;
import com.ict06.team1_fin_pj.common.dto.attendance.LeaveSummaryDTO;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Period;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


// 연차 현황 Service 구현체
@Service
@RequiredArgsConstructor
public class LeaveServiceImpl implements LeaveService {

    // 연차 발생/사용/잔여 조회 Repository
    private final LeaveOccurrenceRepository leaveOccurrenceRepository;

    // 연차 신청 내역 조회 Repository
    private final LeaveRequestRepository leaveRequestRepository;

    // 사원 조회 Repository
    private final EmployeeRepository employeeRepository;

    // 휴가 유형 Repository
    private final LeaveTypeRepository leaveTypeRepository;

    // ==============================
    // 1. 연차 요약 조회
    // ==============================
    // LEAVE_OCCURRENCE 테이블 조회
    @Override
    public LeaveSummaryDTO getLeaveSummary(String empNo) {

        // 현재 연도
        int currentYear = LocalDate.now().getYear();

        // 특정 사원의 현재 연도 연차 조회
        List<LeaveOccurrenceEntity> occurrences =
                leaveOccurrenceRepository
                        .findByEmployee_EmpNoAndTargetYear(
                                empNo,
                                currentYear
                        );

        // 총 연차 합계
        BigDecimal totalDays = occurrences.stream()
                .map(LeaveOccurrenceEntity::getOccurDays)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 사용 연차 합계
        BigDecimal usedDays = occurrences.stream()
                .map(occurrence ->
                        occurrence.getUsed_days() == null
                                ? BigDecimal.ZERO
                                : occurrence.getUsed_days()
                )
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 잔여 연차 합계
        BigDecimal remainDays = occurrences.stream()
                .map(occurrence ->
                        occurrence.getRemain_days() == null
                                ? BigDecimal.ZERO
                                : occurrence.getRemain_days()
                )
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new LeaveSummaryDTO(
                totalDays,
                usedDays,
                remainDays
        );
    }

    // ==============================
    // 2. 연차 사용 내역 조회
    // ==============================
    // LEAVE_REQUEST + LEAVE_TYPE 조회
    @Override
    public List<LeaveHistoryDTO> getLeaveHistory(String empNo) {

        // 특정 사원의 연차 신청 내역 조회
        List<LeaveRequestEntity> requests =
                leaveRequestRepository
                        .findByEmployee_EmpNoOrderByStartDateDesc(empNo);

        // Entity -> DTO 변환
        return requests.stream()
                .map(request -> new LeaveHistoryDTO(

                        // 시작일
                        request.getStartDate(),

                        // 종료일
                        request.getEndDate(),

                        // 휴가 종류명
                        request.getLeaveType().getTypeName(),

                        // 사용 일수
                        request.getLeaveDays(),

                        // 상태값
                        request.getStatus().name()
                ))
                .toList();
    }

    // ==============================
    // 3. 연차 자동 부여
    // ==============================
    // 규칙:
    // 1년 이상 근무 → 15일 부여
    // 1년 미만 근무 → 남은 개월 수만큼 부여
    @Override
    public LeaveSummaryDTO grantAnnualLeave(String empNo) {

        // 1. 사원 조회
        EmpEntity employee = employeeRepository.findByEmpNo(empNo)
                .orElseThrow(() ->
                        new IllegalArgumentException("존재하지 않는 사원입니다.")
                );

        // 2. 현재 날짜
        LocalDate today = LocalDate.now();

        // 현재 연도
        int currentYear = today.getYear();

        // 3. 올해 이미 연차가 부여됐는지 확인
        List<LeaveOccurrenceEntity> existingOccurrences =
                leaveOccurrenceRepository
                        .findByEmployee_EmpNoAndTargetYear(
                                empNo,
                                currentYear
                        );

        // 이미 부여된 경우 중복 INSERT 방지
        if (!existingOccurrences.isEmpty()) {
            return getLeaveSummary(empNo);
        }

        // 4. 연차 타입 조회
        LeaveTypeEntity annualLeaveType =
                leaveTypeRepository.findByTypeName("연차")
                        .orElseThrow(() ->
                                new IllegalArgumentException("연차 타입이 존재하지 않습니다.")
                        );

        // 5. 입사일 조회
        LocalDate hireDate = employee.getHireDate();

        // 6. 근속 기간 계산
        Period period = Period.between(hireDate, today);

        // 7. 부여 연차 계산
        BigDecimal grantDays;

        // 입사 후 1년 이상
        if (period.getYears() >= 1) {

            // 법정 최소 연차 15일
            grantDays = new BigDecimal("15.0");

        } else {

            // 현재 월 ~ 12월까지 남은 개월 수
            int remainingMonths =
                    12 - today.getMonthValue() + 1;

            grantDays =
                    BigDecimal.valueOf(remainingMonths);
        }

        // 8. 연차 발생 내역 저장
        LeaveOccurrenceEntity occurrence =
                LeaveOccurrenceEntity.builder()
                        .employee(employee)
                        .leaveType(annualLeaveType)
                        .targetYear(currentYear)
                        .occurDate(today)
                        .occurDays(grantDays)
                        .used_days(BigDecimal.ZERO)
                        .remain_days(grantDays)
                        .expiryDate(
                                LocalDate.of(currentYear, 12, 31)
                        )
                        .reason("연차 자동 부여")
                        .build();

        leaveOccurrenceRepository.save(occurrence);

        // 9. 저장 후 최신 연차 요약 반환
        return getLeaveSummary(empNo);
    }
}