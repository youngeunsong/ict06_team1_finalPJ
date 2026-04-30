package com.ict06.team1_fin_pj.domain.payroll.repository;

import com.ict06.team1_fin_pj.common.dto.payroll.*;

import java.util.List;
import java.util.Optional;

public interface AdSalaryPolicyRepositoryCustom {

    SalaryPolicyPageResponseDTO selectSalaryPolicyList(SalaryPolicySearchDTO searchDTO);

    List<PayrollSelectOptionDTO> selectDepartmentList();

    List<PayrollSelectOptionDTO> selectPositionList();

    List<PayrollSelectOptionDTO> selectGradeCodeList();

    boolean existsActiveSalaryPolicy(String deptId, String positionId, String gradeId);

    List<SalaryPolicyResponseDTO> selectActivePoliciesByDept(String deptId);

    // 수정 모달 상세 조회 - DTO로 바로 반환
    Optional<SalaryPolicyResponseDTO> selectSalaryPolicyDetail(Long policyId);

    // 수정/삭제 공통 - isActive = false
    void deactivateSalaryPolicy(Integer policyId);


}
