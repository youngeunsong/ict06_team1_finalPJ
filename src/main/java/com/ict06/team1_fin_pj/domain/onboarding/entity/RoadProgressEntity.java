package com.ict06.team1_fin_pj.domain.onboarding.entity;

import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "ROAD_PROGRESS",
       uniqueConstraints = {
            @UniqueConstraint(
                name = "uk_emp_item",
                columnNames = {"emp_no", "item_id"}
            )
       }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoadProgressEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "road_prog_id")
    private Integer roadProgId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no", nullable = false)
    private EmpEntity employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private RoadItemEntity item;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ProgressStatus status;

    @Column(precision = 5, scale = 2)
    private BigDecimal rate;

    //학습 진행 상태 업데이트
    public void updateProgress(ProgressStatus status, BigDecimal rate) {
        this.status = status;
        this.rate = rate;
    }
}
