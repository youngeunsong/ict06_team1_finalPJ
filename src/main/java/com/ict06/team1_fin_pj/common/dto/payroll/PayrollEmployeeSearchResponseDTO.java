package com.ict06.team1_fin_pj.common.dto.payroll;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//급여대장 사원 검색 응답 DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollEmployeeSearchResponseDTO {

    // 사원 PK
    private Long empId;

    // 사번
    private String empNo;

    // 사원명
    private String empName;

    // 본부/부서명
    private String deptFullName;

    // 직급명
    private String positionName;

    // 급여등급
    private String gradeId;
}
