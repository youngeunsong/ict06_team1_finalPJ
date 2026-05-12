/**
 * @author : 송영은
 * description : 관리자용 근태 관리 컨트롤러
 * ========================================
 * DATE         AUTHOR      NOTE
 * 2026-04-24   송영은       최초 생성
 * 2026-05-06   조민수       기능개발
 **/

package com.ict06.team1_fin_pj.domain.attendance.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.ict06.team1_fin_pj.common.dto.attendance.AdAttendanceDTO;
import com.ict06.team1_fin_pj.domain.attendance.service.AdAttendanceService;
import com.ict06.team1_fin_pj.common.dto.attendance.AdAttendanceSummaryDTO;
import com.ict06.team1_fin_pj.common.dto.attendance.AdAttendanceSearchDTO;

import java.io.IOException;

import java.util.List;

@RequestMapping("/admin/attendance")
@Controller
public class AdAttendanceController {

    // 관리자 근태 Service
    private final AdAttendanceService adAttendanceService;

    // 생성자 주입
    public AdAttendanceController(AdAttendanceService adAttendanceService) {
        this.adAttendanceService = adAttendanceService;
    }

    // [근태 관리 메인]
    @RequestMapping("/main")
    public String attendanceMain(
            HttpServletRequest request,
            HttpServletResponse response,
            Model model,

            // 검색 조건: 근무일
            @RequestParam(required = false) String workDate,

            // 검색 조건: 부서 ID
            @RequestParam(required = false) String deptId,

            // 검색 조건: 근태 상태
            @RequestParam(required = false) String status,

            // 검색 조건: 사원명 검색어
            @RequestParam(required = false) String keyword,

            // 현재 페이지 번호
            // Spring Data JPA Page는 0부터 시작
            // 화면에서는 1페이지처럼 보이지만 URL/내부 값은 0부터 사용
            @RequestParam(required = false, defaultValue = "0") int page,

            // 한 페이지당 데이터 개수
            @RequestParam(required = false, defaultValue = "10") int size

    )
            throws ServletException, IOException {
        System.out.println("<<< AdAttendanceController - attendanceMain() >>>");

        // 관리자 근태 상단 요약 카드 조회
        AdAttendanceSummaryDTO summary = adAttendanceService.getAttendanceSummary();

        model.addAttribute("totalCount", summary.getTotalCount());
        model.addAttribute("onTimeCount", summary.getOnTimeCount());
        model.addAttribute("lateCount", summary.getLateCount());
        model.addAttribute("earlyCount", summary.getEarlyCount());

        // 검색 조건 DTO 생성
        AdAttendanceSearchDTO searchDTO = new AdAttendanceSearchDTO();
        searchDTO.setWorkDate(workDate);
        searchDTO.setDeptId(deptId);
        searchDTO.setStatus(status);
        searchDTO.setKeyword(keyword);
        // 페이징 조건 저장
        searchDTO.setPage(page);
        searchDTO.setSize(size);

        // 관리자 근태 목록 조회
        // Service에서 PageImpl<AdAttendanceDTO> 형태로 반환
        Page<AdAttendanceDTO> attendancePage = adAttendanceService.getAttendanceList(searchDTO);

        // 실제 테이블에 출력할 목록
        List<AdAttendanceDTO> attendanceList = attendancePage.getContent();

        // Thymeleaf 로 전달
        model.addAttribute("attendanceList", attendanceList);

        // Thymeleaf 페이징 UI에서 사용할 Page 객체 전달
        model.addAttribute("attendancePage", attendancePage);

        // 검색 버튼을 눌렀을 때 입력한 값이 화면에 그대로 남도록 전달
        // 검색 조건 유지용 DTO 전달
        // 화면에서 searchDTO.workDate, searchDTO.deptId 처럼 사용 가능
        model.addAttribute("searchDTO", searchDTO);

        return "admin/attendance/attendanceMain";
    }
}
