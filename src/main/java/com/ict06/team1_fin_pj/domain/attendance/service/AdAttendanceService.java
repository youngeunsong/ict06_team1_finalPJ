package com.ict06.team1_fin_pj.domain.attendance.service;

import com.ict06.team1_fin_pj.common.dto.attendance.AdAttendanceDTO;
import com.ict06.team1_fin_pj.common.dto.attendance.AdAttendanceSummaryDTO;
import com.ict06.team1_fin_pj.common.dto.attendance.AdAttendanceSearchDTO;
import org.springframework.data.domain.Page;

import java.util.List;


// 관리자 근태 관리 Service 인터페이스
public interface AdAttendanceService {


    // 관리자 근태 목록 조회
    // searchDTO: 날짜/부서/상태/사원명 검색 조건
    Page<AdAttendanceDTO> getAttendanceList(AdAttendanceSearchDTO searchDTO);

    // 관리자 근태 상단 요약 카드 조회
    AdAttendanceSummaryDTO getAttendanceSummary();
}

