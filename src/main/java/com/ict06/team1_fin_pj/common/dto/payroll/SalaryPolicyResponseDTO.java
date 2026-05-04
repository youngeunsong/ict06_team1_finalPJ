package com.ict06.team1_fin_pj.common.dto.payroll;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryPolicyResponseDTO {

    // PK
    private Long policyId;

    // 부서
    private String deptId;
    private String deptName;

    // 직급
    private String positionId;
    private String positionName;

    // 급여 등급
    private String gradeId;
    private String gradeName;
    private String gradeDescription;

    // 급여 정보
    private BigDecimal basicSalary;
    private BigDecimal bonusRate;
    private BigDecimal positionAllowance;

    // 기타
    private String description;
    private Boolean isActive;

    // 날짜
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
