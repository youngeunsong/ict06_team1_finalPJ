package com.ict06.team1_fin_pj.common.dto.employee;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

/*
 * 사원 목록 조회 DTO
 *
 * 사원 목록 화면(list.html)의 테이블에 보여줄 데이터를 담는다.
 * 상세 정보 전체가 아니라 목록에 필요한 값만 가진다.
 */
@Getter
@AllArgsConstructor
public class EmployeeListDto {

    // 사번
    private String empNo;

    // 로그인 아이디
    private String empId;

    // 사원 이름
    private String name;

    // 이메일
    private String email;

    // 연락처
    private String phone;

    // 부서명
    private String deptName;

    // 직급명
    private String positionName;

    // 권한명
    private String roleName;

    // 은행명
    private String bank;

    // 계좌번호
    private String accountNo;

    // 재직 상태
    private String status;

    // 입사일
    private LocalDate hireDate;
}