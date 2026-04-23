package com.ict06.team1_fin_pj.common.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "EMPLOYEE")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpEntity {

    @Id
    @Column(name = "emp_id", length = 20)
    private String empId;

    @Column(name = "emp_no", unique = true, nullable = false, length = 20)
    private String empNo;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "dept_id")
    private Integer deptId;

    @Column(name = "position_id")
    private Integer positionId;

    //1: ADMIN(시스템관리자), 2: TEAM_LEADER(팀장), 3: USER(팀원)
    @Column(name = "role_id")
    private Integer roleId;

    private String status;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Y/N
    @Column(name = "is_deleted", columnDefinition = "char(1)")
    private String isDeleted;
}
