package com.ict06.team1_fin_pj.domain.payroll.repository;

import com.ict06.team1_fin_pj.common.dto.payroll.*;

import java.util.List;
import java.util.Optional;

// 급여대장 QueryDSL Repository
public interface PayrollRepositoryCustom {

    // 사원 검색 autocomplete
    List<PayrollEmployeeSearchResponseDTO> searchEmployees(PayrollEmployeeSearchDTO searchDTO);

    // 사원 인사정보 조회
    Optional<PayrollEmployeeInfoResponseDTO> selectEmployeeInfo(String empNo);

    // 급여대장 상태 조회
    Optional<PayrollStatusResponseDTO> selectPayrollStatus(String empNo, String payMonth);

    // 이전 확정/지급완료 기본급 조회
    Optional<PayrollBaseSalaryResponseDTO> selectRecentConfirmedBaseSalary(String empNo, String payMonth);

    // 현재 기본급 정책 조회
    Optional<PayrollBaseSalaryResponseDTO> selectCurrentSalaryPolicyBaseSalary(String empNo);
}
