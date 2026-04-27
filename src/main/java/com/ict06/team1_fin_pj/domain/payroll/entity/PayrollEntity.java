package com.ict06.team1_fin_pj.domain.payroll.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "PAYROLL",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"emp_no", "pay_month"})
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payroll_id")
    private Integer payrollId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no", nullable = false)
    private EmpEntity employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_id")
    private GradeCodeEntity grade;

    @Column(name = "pay_month", nullable = false, length = 7)
    private String payMonth;

    @Builder.Default
    @Column(name = "family_count")
    private Integer familyCount = 1;

    @Builder.Default @Column(precision = 15, scale = 2)
    private BigDecimal baseSalary = BigDecimal.ZERO;

    @Builder.Default @Column(precision = 15, scale = 2)
    private BigDecimal bonus = BigDecimal.ZERO;

    @Builder.Default @Column(name = "total_allowance", precision = 15, scale = 2)
    private BigDecimal totalAllowance = BigDecimal.ZERO;

    @Builder.Default @Column(name = "total_gross", precision = 15, scale = 2)
    private BigDecimal totalGross = BigDecimal.ZERO;

    @Builder.Default @Column(name = "taxable_income", precision = 15, scale = 2)
    private BigDecimal taxableIncome = BigDecimal.ZERO;

    @Builder.Default @Column(name = "income_tax", precision = 15, scale = 2)
    private BigDecimal incomeTax = BigDecimal.ZERO;

    @Builder.Default @Column(name = "local_income_tax", precision = 15, scale = 2)
    private BigDecimal localIncomeTax = BigDecimal.ZERO;

    @Builder.Default @Column(name = "national_pension_amount", precision = 15, scale = 2)
    private BigDecimal nationalPensionAmount = BigDecimal.ZERO;

    @Builder.Default @Column(name = "health_insurance_amount", precision = 15, scale = 2)
    private BigDecimal healthInsuranceAmount = BigDecimal.ZERO;

    @Builder.Default @Column(name = "long_term_care_amount", precision = 15, scale = 2)
    private BigDecimal longTermCareAmount = BigDecimal.ZERO;

    @Builder.Default @Column(name = "employment_insurance_amount", precision = 15, scale = 2)
    private BigDecimal employmentInsuranceAmount = BigDecimal.ZERO;

    @Builder.Default @Column(name = "total_insurance", precision = 15, scale = 2)
    private BigDecimal totalInsurance = BigDecimal.ZERO;

    @Builder.Default @Column(name = "total_deduction", precision = 15, scale = 2)
    private BigDecimal totalDeduction = BigDecimal.ZERO;

    @Builder.Default @Column(name = "net_salary", precision = 15, scale = 2)
    private BigDecimal netSalary = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PayrollStatus status = PayrollStatus.DRAFT;

    @Column(name = "pay_date")
    private LocalDate payDate;

    @Builder.Default
    @OneToMany(mappedBy = "payroll", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PayrollItemEntity> items = new ArrayList<>();
}
