package com.ict06.team1_fin_pj.common.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "LEAVE_REQUEST")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequestEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "leave_request_id")
    private Integer leaveRequestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no", nullable = false)
    private EmpEntity employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveTypeEntity leaveType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "leave_days", precision = 4, scale = 1)
    private BigDecimal leaveDays;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeaveStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approval_id")
    private ApprovalEntity approval;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @PrePersist
    public void prePersist() {
        if(this.status == null) {
            this.status = LeaveStatus.PENDING;
        }
    }
}
