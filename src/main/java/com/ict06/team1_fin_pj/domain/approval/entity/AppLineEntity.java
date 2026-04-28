package com.ict06.team1_fin_pj.domain.approval.entity;

import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "APP_LINE")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppLineEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "line_id")
    private Integer lineId;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approval_id", nullable = false)
    private ApprovalEntity approval;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_no", nullable = false)
    private EmpEntity approver;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Enumerated(EnumType.STRING)
    private ApprovalLineStatus status;

    private LocalDateTime processedAt;

}
