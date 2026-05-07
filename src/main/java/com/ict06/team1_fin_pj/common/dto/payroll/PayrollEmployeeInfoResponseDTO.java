package com.ict06.team1_fin_pj.common.dto.payroll;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//사원 인사정보 응답 DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollEmployeeInfoResponseDTO {

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

    // 급여등급 설명
    private String gradeDescription;

    // 입사일
    private String hireDate;

    // 은행명
    private String bankName;

    // 계좌번호
    private String accountNumber;
}
