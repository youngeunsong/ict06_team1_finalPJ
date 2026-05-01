package com.ict06.team1_fin_pj.common.dto.employee;

import lombok.AllArgsConstructor;
import lombok.Getter;

/*
 * select 박스 옵션용 DTO
 *
 * 부서, 직급, 권한 목록을 화면 select 태그에 넣을 때 사용한다.
 *
 * 예:
 * id = 1
 * name = 개발팀
 */
@Getter
@AllArgsConstructor
public class HrSelectOptionDto {

    // option 태그의 value 값으로 사용
    private Integer id;

    // option 태그에 화면 표시되는 이름으로 사용
    private String name;
}