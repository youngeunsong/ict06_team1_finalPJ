package com.ict06.team1_fin_pj.common.dto.payroll;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SalaryPolicySearchDTO {

    // 부서 필터
    private String deptId;

    // 직급 필터
    private String positionId;

    // 급여등급 필터: G1, G2, G3, G4
    private String gradeId;

    // 검색어: 부서명, 직급명, 등급명, 설명 등 검색용
    private String keyword;
}
