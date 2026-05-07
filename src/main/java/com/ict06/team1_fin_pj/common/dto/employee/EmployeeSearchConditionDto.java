package com.ict06.team1_fin_pj.common.dto.employee;

import lombok.Getter;
import lombok.Setter;

/*
 * 사원 검색 조건 DTO
 *
 * 사원 목록 화면에서 검색할 때 사용한다.
 *
 * 검색 조건:
 * - 키워드
 * - 본부
 * - 팀
 * - 직급
 * - 권한
 * - 상태
 */
@Getter
@Setter
public class EmployeeSearchConditionDto {

    /*
     * 검색어
     *
     * Repository에서 사번, 아이디, 이름, 이메일, 연락처를 대상으로 검색한다.
     */
    private String keyword;

    /*
     * 선택한 본부 ID
     *
     * 사원 목록 검색 화면에서 첫 번째 부서 select로 사용한다.
     *
     * 예:
     * parentDeptId = 개발본부 ID
     *
     * 동작:
     * - 본부만 선택하면 해당 본부 아래 모든 팀 사원을 조회한다.
     */
    private Integer parentDeptId;

    /*
     * 선택한 팀 ID
     *
     * 사원 목록 검색 화면에서 두 번째 부서 select로 사용한다.
     *
     * 예:
     * deptId = 개발1팀 ID
     *
     * 동작:
     * - 팀까지 선택하면 해당 팀 사원만 조회한다.
     */
    private Integer deptId;

    /*
     * 선택한 직급 ID
     */
    private Integer positionId;

    /*
     * 선택한 권한 ID
     */
    private Integer roleId;

    /*
     * 상태 검색 조건
     *
     * 사용 값:
     * - 기본: 재직/휴직만 조회
     * - 전체: 모든 상태 조회
     * - 재직
     * - 휴직
     * - 퇴사
     */
    private String status;
}