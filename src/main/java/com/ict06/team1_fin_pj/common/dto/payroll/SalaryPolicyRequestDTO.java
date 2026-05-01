package com.ict06.team1_fin_pj.common.dto.payroll;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class SalaryPolicyRequestDTO {

    // 🔹 수정 시 필요 (등록 시는 null 가능)
    private Long policyId;

    // 🔹 선택값 (select box에서 넘어옴)
    private String deptId;
    private String positionId;
    private String gradeId;

    // 🔹 입력값
    private BigDecimal basicSalary;
    private BigDecimal bonusRate;
    private BigDecimal positionAllowance;

    // 🔹 기타 입력
    private String description;
    private Boolean isActive;

}
