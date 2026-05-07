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
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_dept_id")
    private DepartmentEntity parentDept;

    /*
     * 하위 부서 목록
     *
     * 하나의 본부 아래에 여러 팀이 있을 수 있으므로 List로 관리한다.
     */
    @Builder.Default
    @OneToMany(mappedBy = "parentDept", orphanRemoval = false, fetch = FetchType.LAZY)
    private List<DepartmentEntity> children = new ArrayList<>();

    /*
     * 하위 부서 추가 메서드
     *
     * 본부에 팀을 추가할 때 사용한다.
     */
    public void addChildDepartment(DepartmentEntity child) {
        this.children.add(child);
        child.setParent(this);
    }

    /*
     * 상위 부서 설정 메서드
     *
     * 팀의 소속 본부를 지정하거나 변경할 때 사용한다.
     */
    public void setParent(DepartmentEntity parent) {
        this.parentDept = parent;
    }

    /*
     * 부서명 수정 메서드
     *
     * 부서 관리 화면에서 본부명 또는 팀명을 수정할 때 사용한다.
     *
     * Entity에 setter를 전체로 열어두지 않고,
     * 필요한 변경 기능만 메서드로 제공하는 방식이다.
     */
    public void updateDeptName(String deptName) {
        this.deptName = deptName;
    }

    /*
     * 부서 정보 수정 메서드
     *
     * 부서명과 상위 부서를 함께 수정할 때 사용한다.
     *
     * parentDept가 null이면 본부,
     * parentDept가 있으면 팀으로 처리된다.
     */
    public void updateDepartment(String deptName, DepartmentEntity parentDept) {
        this.deptName = deptName;
        this.parentDept = parentDept;
    }
}