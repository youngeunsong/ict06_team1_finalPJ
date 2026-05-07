package com.ict06.team1_fin_pj.domain.payroll.service;

import com.ict06.team1_fin_pj.common.dto.payroll.*;

import java.util.List;

// 관리자용 급여대장 서비스
public interface AdPayrollService {

    // 사원 검색 autocomplete
    List<PayrollEmployeeSearchResponseDTO> searchEmployees(PayrollEmployeeSearchDTO searchDTO);

    // 사원 인사정보 조회
    PayrollEmployeeInfoResponseDTO getEmployeeInfo(String empNo);

    // 급여대장 상태 조회
    PayrollStatusResponseDTO getPayrollStatus(PayrollMainRequestDTO requestDTO);

    // 기본급 자동 로딩
    PayrollBaseSalaryResponseDTO getBaseSalary(PayrollMainRequestDTO requestDTO);
}
