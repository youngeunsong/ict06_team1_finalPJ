package com.ict06.team1_fin_pj.common.dto.payroll;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

// 공통 select box (드롭다운) 데이터 전달용 DTO
// - 부서, 직급, 급여등급 모두 동일한 구조(id, name)로 사용하기 위해 만든 재사용 DTO
@Getter // 모든 필드 getter 자동 생성
@NoArgsConstructor // 기본 생성자 (JSON 바인딩 / QueryDSL / Jackson 등에서 필요)
@AllArgsConstructor // 전체 필드 생성자
public class PayrollSelectOptionDTO {

    // 공통 식별값 (PK 역할)
    // - 부서 → deptId
    // - 직급 → positionId
    // - 급여등급 → gradeId
    private String id;

    // 화면에 표시할 이름
    // - 부서 → deptName
    // - 직급 → positionName
    // - 급여등급 → gradeName
    private String name;

    // 추가 설명 (선택값)
    // - 급여등급 설명 등에서 사용
    // - 부서/직급에서는 null일 수 있음
    private String description;

    // description이 필요 없는 경우 사용하는 생성자
    // → 대부분의 select box는 id + name만 필요
    public PayrollSelectOptionDTO(String id, String name) {
        this.id = id;
        this.name = name;
    }
}
