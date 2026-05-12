package com.ict06.team1_fin_pj.domain.attendance.service;

import com.ict06.team1_fin_pj.common.dto.attendance.AdAttendanceDTO;
import com.ict06.team1_fin_pj.common.dto.attendance.AdAttendanceSummaryDTO;
import com.ict06.team1_fin_pj.common.dto.attendance.AdAttendanceSearchDTO;
import com.ict06.team1_fin_pj.domain.attendance.repository.AttendanceRepository;
import com.ict06.team1_fin_pj.domain.attendance.entity.AttendanceEntity;
import com.ict06.team1_fin_pj.domain.attendance.entity.AttendanceStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

// 관리자 근태 관리 Service 구현체
@Service
public class AdAttendanceServiceImpl implements AdAttendanceService {

    // 근태 Repository
    private final AttendanceRepository attendanceRepository;

    // 생성자 주입
    public AdAttendanceServiceImpl(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    // 관리자 근태 목록 조회
    @Override
    public Page<AdAttendanceDTO> getAttendanceList(AdAttendanceSearchDTO searchDTO) {

        // 1. page / size 값 준비
        int page = searchDTO.getPage();
        int size = searchDTO.getSize();

        // Spring Data JPA Page는 0부터 시작하므로 음수 방어
        if (page < 0) {
            page = 0;
        }

        // 한 페이지 크기가 1보다 작으면 기본값 10으로 보정
        if (size < 1) {
            size = 10;
        }

        // 2. Pageable 생성
        Pageable pageable = PageRequest.of(page, size);

        // 3. DB에서 근태 목록 조회
        // JpaRepository 기본 메서드 findAll(Pageable)
        // ATTENDANCE 테이블을 페이지 단위로 조회
        Page<AttendanceEntity> attendanceEntityPage =
                attendanceRepository.findAll(pageable);

        // DB에서 조회된 전체 데이터 개수 확인
        System.out.println("전체 근태 데이터 수 = " + attendanceEntityPage.getTotalElements());

        // 현재 페이지에 조회된 데이터 개수 확인
        System.out.println("현재 페이지 데이터 수 = " + attendanceEntityPage.getNumberOfElements());

        // 4. Entity Page → DTO Page 변환
        // Page.map()
        // - Page 구조는 유지하면서 안의 데이터 타입만 변환
        // - AttendanceEntity → AdAttendanceDTO
        return attendanceEntityPage.map(attendance ->
                AdAttendanceDTO.builder()
                        // 사번
                        // attendance 테이블의 emp_no가 employee 테이블과 정상 연결되어 있으면 사번 출력
                        // 만약 employee 연결이 없으면 "-" 출력해서 화면 오류 방지
                        .empNo(
                                attendance.getEmployee() != null
                                        ? attendance.getEmployee().getEmpNo()
                                        : "-"
                        )

                        // 사원명
                        // employee 정보가 있으면 이름 출력
                        // employee 정보가 없으면 "-" 출력
                        // 관리자 화면은 전체 근태 조회이므로 일부 테스트 데이터의 emp_no가 employee에 없을 수 있어 방어 처리
                        .empName(
                                attendance.getEmployee() != null
                                        ? attendance.getEmployee().getName()
                                        : "-"
                        )

                        // 부서명
                        // attendance → employee → department → deptName 순서로 부서명 조회
                        // employee 또는 department가 없으면 "-" 출력해서 화면 오류 방지
                        .deptName(
                                attendance.getEmployee() != null
                                        && attendance.getEmployee().getDepartment() != null
                                        ? attendance.getEmployee().getDepartment().getDeptName()
                                        : "-"
                        )

                        // 근무일
                        .workDate(
                                attendance.getWorkDate() != null
                                        ? attendance.getWorkDate().toString()
                                        : "-"
                        )

                        // 출근 시간
                        .checkIn(
                                attendance.getCheckInAt() != null
                                        ? attendance.getCheckInAt().toLocalTime().toString()
                                        : "-"
                        )

                        // 퇴근 시간
                        .checkOut(
                                attendance.getCheckOutAt() != null
                                        ? attendance.getCheckOutAt().toLocalTime().toString()
                                        : "-"
                        )

                        // 근무 시간
                        .workHours(
                                attendance.getWorkHours() != null
                                        ? attendance.getWorkHours() + "시간"
                                        : "-"
                        )

                        // 상태
                        // DB Enum 값은 ON_TIME, LATE, EARLY 같은 코드이므로
                        // 화면 Badge에서 쓰기 쉽게 한글 상태명으로 변환
                        .status(
                                attendance.getStatus() != null
                                        ? convertStatusName(attendance.getStatus().name())
                                        : "-"
                        )
                        .build()
        );
    }

    /**
     * 근태 상태 코드 → 화면용 한글 상태명 변환
     *
     * DB에는 ON_TIME, LATE, EARLY 같은 코드로 저장되어 있고,
     * Thymeleaf 화면에서는 정상, 지각, 조퇴 같은 한글 상태명으로 Badge를 출력한다.
     */
    private String convertStatusName(String statusCode) {

        if ("ON_TIME".equals(statusCode)) {
            return "정상";
        }

        if ("LATE".equals(statusCode)) {
            return "지각";
        }

        if ("EARLY".equals(statusCode)) {
            return "조퇴";
        }

        if ("ABSENT".equals(statusCode)) {
            return "결근";
        }

        if ("LEFT".equals(statusCode)) {
            return "퇴근완료";
        }

        return statusCode;
    }

    // 관리자 근태 상단 요약 카드 조회
    @Override
    public AdAttendanceSummaryDTO getAttendanceSummary() {

        // 전체 근태 건수
        // ATTENDANCE 테이블 전체 row 수 조회
        int totalCount = (int) attendanceRepository.count();

        // 정상 출근 수
        // status = ON_TIME 인 데이터 개수 조회
        int onTimeCount = (int) attendanceRepository.countByStatus(AttendanceStatus.ON_TIME);

        // 지각 수
        // status = LATE 인 데이터 개수 조회
        int lateCount = (int) attendanceRepository.countByStatus(AttendanceStatus.LATE);

        // 조퇴 수
        // status = EARLY 인 데이터 개수 조회
        int earlyCount = (int) attendanceRepository.countByStatus(AttendanceStatus.EARLY);

        // 화면 상단 카드에 전달할 DTO 생성
        return AdAttendanceSummaryDTO.builder()
                .totalCount(totalCount)
                .onTimeCount(onTimeCount)
                .lateCount(lateCount)
                .earlyCount(earlyCount)
                .build();
    }

}