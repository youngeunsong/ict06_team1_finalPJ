package com.ict06.team1_fin_pj.domain.approval.entity;

import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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

    /**
     * 결재 문서와 결재선의 양방향 연관관계를 맞추기 위한 메서드입니다.
     * 외부에서 임의로 approval을 바꾸지 않도록 Setter 대신 의미가 분명한 메서드로 제한합니다.
     */
    public void assignApproval(ApprovalEntity approval) {
        this.approval = approval;
    }
}
