package com.ict06.team1_fin_pj.domain.attendance.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "LEAVE_TYPE")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveTypeEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "type_id")
    private Integer typeId;

    @Column(name = "type_name", nullable = false)
    private String typeName;

    @Column(name = "min_unit", precision = 3, scale = 1)
    private BigDecimal minUnit;

    @Builder.Default
    @Column(name = "is_paid")
    private Boolean isPaid = true;

    @Builder.Default
    @Column(name = "is_annual_deduct")
    private Boolean isAnnualDeduct = true;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}
