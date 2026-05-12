package com.ict06.team1_fin_pj.domain.payroll.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

// 급여 계산 요율 설정
// - 보험요율/원천징수율은 DB나 서비스 하드코딩이 아니라 properties에서 관리한다.
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "payroll.rate")
public class PayrollRateProperties {

    // 국민연금 근로자 부담분
    private BigDecimal nationalPension;

    // 건강보험 근로자 부담분
    private BigDecimal healthInsurance;

    // 장기요양보험: 건강보험료 기준 요율
    private BigDecimal longTermCare;

    // 고용보험 근로자 부담분
    private BigDecimal employmentInsurance;

    // 임시 원천징수 고정세율
    private BigDecimal incomeTax;

    // 지방소득세: 소득세 기준
    private BigDecimal localIncomeTax;
}
