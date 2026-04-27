package com.ict06.team1_fin_pj.domain.approval.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.PositionEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "APP_LINE_TEMPLATE_DETAIL")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppLineTemplateDetailEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "detail_id")
    private Integer detailId;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private AppLineTemplateEntity template;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "approver_type", nullable = false, length = 20)
    private ApproverType approverType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private EmpEntity approver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id")
    private DepartmentEntity department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "min_position_id")
    private PositionEntity minPosition;

    @Column(length = 200)
    private String description;

}
