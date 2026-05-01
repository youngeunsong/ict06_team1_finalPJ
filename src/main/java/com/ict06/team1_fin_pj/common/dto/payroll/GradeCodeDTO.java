package com.ict06.team1_fin_pj.common.dto.payroll;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class GradeCodeDTO {

    // 🔹 급여 등급 코드 (G1, G2, G3...)
    private String gradeId;

    // 🔹 급여 등급 이름 (사원, 대리, 과장 등 or 등급 설명)
    private String gradeName;
}
