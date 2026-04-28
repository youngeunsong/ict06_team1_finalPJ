package com.ict06.team1_fin_pj.domain.approval.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "APPROVAL")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "approval_id")
    private Integer approvalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id")
    private AppFormEntity form;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "jsonb")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writer_no", nullable = false)
    private EmpEntity writer;

    @Column(name = "current_step")
    private Integer currentStep;

    @Column(name = "max_step")
    private Integer maxStep;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_approver_no")
    private EmpEntity currentApprover;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @Builder.Default
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @OneToMany(mappedBy = "approval", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AppLineEntity> lines = new ArrayList<>();

    @OneToMany(mappedBy = "approval", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AppFileEntity> files = new ArrayList<>();
}
