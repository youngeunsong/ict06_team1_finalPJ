package com.ict06.team1_fin_pj.domain.payroll.controller;

import com.ict06.team1_fin_pj.common.dto.payroll.*;
import com.ict06.team1_fin_pj.domain.payroll.service.AdPayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;


// 관리자용 급여대장 컨트롤러
@Controller
@RequiredArgsConstructor
@RequestMapping("/admin/payroll")
public class AdPayrollController {

    private final AdPayrollService adPayrollService;

    // 급여대장 메인 페이지
    @GetMapping("/main")
    public String payrollMainPage() {
        return "admin/payroll/payroll-main";
    }

    // 사원 검색 autocomplete
    @GetMapping("/main/employees/search")
    @ResponseBody
    public List<PayrollEmployeeSearchResponseDTO> searchEmployees(PayrollEmployeeSearchDTO searchDTO) {
        return adPayrollService.searchEmployees(searchDTO);
    }

    // 사원 인사정보 조회
    @GetMapping("/main/employees/{empNo}")
    @ResponseBody
    public PayrollEmployeeInfoResponseDTO getEmployeeInfo(@PathVariable String empNo) {
        return adPayrollService.getEmployeeInfo(empNo);
    }

    // 급여대장 상태 조회
    @GetMapping("/main/status")
    @ResponseBody
    public PayrollStatusResponseDTO getPayrollStatus(PayrollMainRequestDTO requestDTO) {
        return adPayrollService.getPayrollStatus(requestDTO);
    }

    // 기본급 자동 로딩
    @GetMapping("/main/base-salary")
    @ResponseBody
    public PayrollBaseSalaryResponseDTO getBaseSalary(PayrollMainRequestDTO requestDTO) {
        return adPayrollService.getBaseSalary(requestDTO);
    }
}
