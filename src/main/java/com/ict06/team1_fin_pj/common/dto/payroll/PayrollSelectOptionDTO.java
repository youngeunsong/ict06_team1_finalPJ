package com.ict06.team1_fin_pj.common.dto.payroll;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PayrollSelectOptionDTO {

    private String id;    // deptId / positionId / gradeId
    private String name;  // deptName / positionName / gradeName
}
