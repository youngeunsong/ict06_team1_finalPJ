package com.ict06.team1_fin_pj.domain.payroll.repository;

import com.ict06.team1_fin_pj.common.dto.payroll.*;

import java.util.List;

public interface AdSalaryPolicyRepositoryCustom {

    SalaryPolicyPageResponseDTO selectSalaryPolicyList(SalaryPolicySearchDTO searchDTO);

    List<PayrollSelectOptionDTO> selectDepartmentList();

    List<PayrollSelectOptionDTO> selectPositionList();

    List<PayrollSelectOptionDTO> selectGradeCodeList();



}
