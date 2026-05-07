package com.ict06.team1_fin_pj.common.dto.employee;

import lombok.Getter;
import lombok.Setter;

/*
 * 부서 등록 요청 DTO
 *
 * 관리자 부서 관리 화면에서 본부 또는 팀을 등록할 때 사용한다.
 *
 * 등록 방식:
 * - parentDeptId가 null이면 본부 등록
 * - parentDeptId가 있으면 해당 본부 아래 팀 등록
 */
@Getter
@Setter
public class DepartmentCreateRequestDto {

    /*
     * 부서명
     *
     * 예:
     * 개발본부, 인사팀, 총무팀
     */
    private String deptName;

    /*
     * 상위 부서 ID
     *
     * 본부 등록: null
     * 팀 등록: 소속 본부의 deptId
     */
    private Integer parentDeptId;
}