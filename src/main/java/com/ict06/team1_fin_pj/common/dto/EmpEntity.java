package com.ict06.team1_fin_pj.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "EMPLOYEE")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpEntity extends BaseTimeEntity {

    @Id
    @Column(name = "emp_no", unique = true, nullable = false, length = 20)
    private String empNo;

    @Column(name = "emp_id", length = 20)
    private String empId;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id", nullable = false)
    @JsonIgnore
    private DepartmentEntity department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id", nullable = false)
    private PositionEntity position;

    //1: ADMIN(시스템관리자), 2: TEAM_LEADER(팀장), 3: USER(팀원)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private RoleEntity role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_id")
    private GradeCodeEntity grade;

    @Builder.Default
    private String status = "재직";

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(name = "resignation_date")
    private LocalDate resignationDate;

    @Column(name = "profile_img")
    private String profileImg;

    @Column(name = "sign_img")
    private String signImg;

    // Y/N
    @Builder.Default
    @Column(name = "is_deleted", columnDefinition = "char(1)")
    private String isDeleted = "N";
}