package com.ict06.team1_fin_pj.common.dto.employee;

import lombok.Getter;
import lombok.Setter;

/*
 * 부서 수정 요청 DTO
 *
 * 관리자 부서 관리 화면에서 부서명을 수정하거나
 * 팀의 상위 본부를 변경할 때 사용한다.
 */
@Getter
@Setter
public class DepartmentUpdateRequestDto {

    /*
     * 수정할 부서명
     */
    private String deptName;

    /*
     * 변경할 상위 부서 ID
     *
     * null이면 본부로 변경
     * 값이 있으면 해당 본부 아래 팀으로 변경
     */
    private Integer parentDeptId;
}