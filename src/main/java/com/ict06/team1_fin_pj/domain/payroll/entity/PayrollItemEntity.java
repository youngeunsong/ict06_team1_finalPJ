package com.ict06.team1_fin_pj.domain.payroll.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "PAYROLL_ITEM")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollItemEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payroll_item_id")
    private Integer payrollItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_id", nullable = false)
    private PayrollEntity payroll;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_setting_id")
    private PayItemSettingEntity itemSetting;

    @Column(name = "item_name_snapshot", nullable = false, length = 100)
    private String itemNameSnapshot;

    @Column(name = "item_type", nullable = false, length = 20)
    private String itemType;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "tax_type", length = 20)
    private String taxType;

    @Column(name = "non_tax_code", length = 20)
    private String nonTaxCode;

    @Builder.Default
    @Column(name = "taxable_amount", precision = 15, scale = 2)
    private BigDecimal taxableAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "non_taxable_amount", precision = 15, scale = 2)
    private BigDecimal nonTaxableAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "is_valid_non_tax")
    private Boolean isValidNonTax = true;
}
