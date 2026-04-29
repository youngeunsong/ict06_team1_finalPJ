package com.ict06.team1_fin_pj.domain.payroll.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "PAY_ITEM_SETTING")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayItemSettingEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_setting_id")
    private Integer itemSettingId;

    @Column(name = "item_name", nullable = false, length = 100)
    private String itemName;

    @Column(name = "item_type", nullable = false, length = 20)
    private String itemType;

    @Column(name = "non_tax_code", length = 20)
    private String nonTaxCode;

    @Column(name = "tax_type", length = 20)
    private String taxType;

    @Column(name = "linked_attendance_type", length = 30)
    private String linkedAttendanceType;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}
