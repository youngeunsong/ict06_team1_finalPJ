package com.ict06.team1_fin_pj.domain.attendance.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "LEAVE_OCCURRENCE")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveOccurrenceEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "occurrence_id")
    private Integer occurrenceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no", nullable = false)
    private EmpEntity employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", nullable = false)
    private LeaveTypeEntity leaveType;

    @Column(name = "target_year", nullable = false)
    private Integer targetYear;

    @Column(name = "occur_date", nullable = false)
    private LocalDate occurDate;

    @Column(name = "occur_days", nullable = false, precision = 4, scale = 1)
    private BigDecimal occurDays;

    @Column(name = "used_days", precision = 4, scale = 1)
    private BigDecimal used_days;

    @Column(name = "remain_days", precision = 4, scale = 1)
    private BigDecimal remain_days;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;
}
