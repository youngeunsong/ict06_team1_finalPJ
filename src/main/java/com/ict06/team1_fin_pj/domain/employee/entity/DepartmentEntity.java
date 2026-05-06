package com.ict06.team1_fin_pj.domain.employee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/*
 * 부서 엔티티
 *
 * DEPARTMENT 테이블과 연결되는 클래스이다.
 *
 * 이 엔티티는 자기 자신을 참조하는 self FK 구조이다.
 *
 * 구조:
 * - parentDept가 null이면 최상위 부서, 즉 본부
 * - parentDept가 있으면 특정 본부 아래의 팀
 *
 * 예:
 * 경영본부
 * ├─ 경영지원팀
 * └─ 인사팀
 *
 * 개발본부
 * ├─ 개발1팀(BE)
 * ├─ 개발2팀(FE)
 * └─ 디자인팀
 */
@Entity
@Table(name = "DEPARTMENT")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentEntity {

    /*
     * 부서 ID
     *
     * DEPARTMENT 테이블의 기본키이다.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dept_id")
    private Integer deptId;

    /*
     * 부서명
     *
     * 예:
     * 경영본부, 개발본부, 인사팀, 디자인팀
     */
    @Column(name = "dept_name", nullable = false, length = 50)
    private String deptName;

    /*
     * 상위 부서
     *
     * 자기 자신 DepartmentEntity를 다시 참조하는 구조이다.
     *
     * DB 컬럼:
     * parent_dept_id
     *
     * 의미:
     * - null이면 본부
     * - 값이 있으면 해당 본부 아래의 팀
     *
     * 예:
     * 인사팀.parentDept = 경영본부
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_dept_id", nullable = true)
    private DepartmentEntity parentDept;

    /*
     * 하위 부서 목록
     *
     * 하나의 본부 아래에 여러 팀이 있을 수 있으므로 List로 관리한다.
     *
     * mappedBy = "parentDept"
     * - parentDept 필드가 관계의 주인이라는 뜻이다.
     *
     * orphanRemoval = false
     * - 하위 부서를 children 리스트에서 제거해도 DB에서 자동 삭제하지 않는다.
     */
    @Builder.Default
    @OneToMany(mappedBy = "parentDept", orphanRemoval = false, fetch = FetchType.LAZY)
    private List<DepartmentEntity> children = new ArrayList<>();

    /*
     * 하위 부서 추가 메서드
     *
     * 본부에 팀을 추가할 때 사용한다.
     *
     * 예:
     * 경영본부.addChildDepartment(인사팀)
     *
     * 이 메서드를 사용하면:
     * 1. 본부의 children 리스트에 팀이 추가되고
     * 2. 팀의 parentDept도 본부로 설정된다.
     */
    public void addChildDepartment(DepartmentEntity child) {
        this.children.add(child);
        child.setParent(this);
    }

    /*
     * 상위 부서 설정 메서드
     *
     * 특정 부서의 parentDept를 지정한다.
     *
     * 예:
     * 인사팀.setParent(경영본부)
     */
    public void setParent(DepartmentEntity parent) {
        this.parentDept = parent;
    }
}