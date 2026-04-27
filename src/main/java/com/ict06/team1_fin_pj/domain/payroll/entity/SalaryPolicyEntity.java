package com.ict06.team1_fin_pj.domain.payroll.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.PositionEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(
        name = "SALARY_POLICY",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"grade_id", "dept_id", "position_id"})
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryPolicyEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "policy_id")
    private Integer policyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_id", nullable = false)
    private GradeCodeEntity grade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id", nullable = false)
    private DepartmentEntity department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id", nullable = false)
    private PositionEntity position;

    @Column(name = "basic_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal basicSalary;

    @Column(name = "bonus_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal bonusRate = BigDecimal.ZERO;

    @Column(name = "position_allowance", nullable = false, precision = 15, scale = 2)
    private BigDecimal positionAllowance = BigDecimal.ZERO;

    @Column(name = "description", length = 200)
    private String description;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}
