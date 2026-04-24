package com.ict06.team1_fin_pj.common.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "DEPARTMENT")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentEntity {

    @Id
    @Column(name = "dept_id")
    private Integer deptId;

    @Column(name = "dept_name", nullable = false, length = 50)
    private String deptName;

    @Column(name = "parent_dept_id")
    private Integer parentDeptId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
