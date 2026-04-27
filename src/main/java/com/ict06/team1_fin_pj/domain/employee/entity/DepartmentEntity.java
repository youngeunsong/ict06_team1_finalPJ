package com.ict06.team1_fin_pj.domain.employee.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "DEPARTMENT")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dept_id")
    private Integer deptId;

    @Column(name = "dept_name", nullable = false, length = 50)
    private String deptName;

    //상위부서(self FK 설정, parent_dept_id와 매핑)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_dept_id", nullable = true)
    //@JsonIgnore
    private DepartmentEntity parentDept;

    //하위부서
    //하나의 상위부서 아래에 여러 하위 부서 존재 가능하므로 List로 설정
    @Builder.Default
    @OneToMany(mappedBy = "parentDept", orphanRemoval = false, fetch = FetchType.LAZY)
    private List<DepartmentEntity> children = new ArrayList<>();

    public void addChildDepartment(DepartmentEntity child) {
        this.children.add(child);
        child.setParent(this);
    }

    public void setParent(DepartmentEntity parent) {
        this.parentDept = parent;
    }
}
