package com.ict06.team1_fin_pj.domain.approval.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.PositionEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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

    /**
     * 결재선 템플릿과 상세 항목의 양방향 연관관계를 맞추기 위한 메서드입니다.
     * AppLineTemplateEntity.addDetail()에서 호출해 detail의 소속 템플릿을 명확히 지정합니다.
     */
    public void assignTemplate(AppLineTemplateEntity template) {
        this.template = template;
    }
}
