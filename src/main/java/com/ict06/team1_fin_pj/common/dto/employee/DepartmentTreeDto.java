package com.ict06.team1_fin_pj.common.dto.employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/*
 * 조직도 부서 트리 DTO
 *
 * 왼쪽 조직도 영역에서 사용할 데이터이다.
 *
 * Entity를 그대로 JSON으로 반환하면
 * parentDept / children 관계 때문에 순환 참조 문제가 생길 수 있으므로
 * 화면에 필요한 값만 DTO로 내려준다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentTreeDto {

    /*
     * 부서 ID
     */
    private Integer deptId;

    /*
     * 부서명
     *
     * 예:
     * 개발본부, 인사팀, 백엔드팀
     */
    private String deptName;

    /*
     * 하위 부서 목록
     *
     * 예:
     * 개발본부
     * ├─ 백엔드팀
     * └─ 프론트엔드팀
     */
    @Builder.Default
    private List<DepartmentTreeDto> children = new ArrayList<>();

    /*
     * 하위 부서를 추가하는 메서드
     *
     * 서비스에서 트리 구조를 만들 때 사용한다.
     */
    public void addChild(DepartmentTreeDto child) {
        this.children.add(child);
    }
}