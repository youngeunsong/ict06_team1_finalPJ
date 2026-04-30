package com.ict06.team1_fin_pj.common.dto.payroll;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SalaryPolicyRegisterCheckResponseDTO {

    private String gradeId;
    private String gradeName;
    private boolean duplicate;
    private String message;
}
