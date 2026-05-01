package com.ict06.team1_fin_pj.common.dto.employee;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

/*
 * 사원 상세 조회 DTO
 *
 * 사원 상세 화면(detail.html)에 보여줄 데이터를 담는다.
 * Repository에서 JPQL로 바로 이 DTO에 값을 넣어 반환한다.
 */
@Getter
@AllArgsConstructor
public class EmployeeDetailDto {

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

    // 부서 ID
    private Integer deptId;

    // 부서명
    private String deptName;

    // 직급 ID
    private Integer positionId;

    // 직급명
    private String positionName;

    // 권한 ID
    private Integer roleId;

    // 권한명
    private String roleName;

    // 은행명
    private String bank;

    // 계좌번호
    private String accountNo;

    // 재직 상태
    // 예: 재직, 휴직, 퇴사
    private String status;

    // 입사일
    private LocalDate hireDate;

    // 프로필 이미지 경로
    private String profileImg;

    // 서명 이미지 경로
    private String signImg;
}