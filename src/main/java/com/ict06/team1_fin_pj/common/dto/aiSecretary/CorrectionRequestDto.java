package com.ict06.team1_fin_pj.common.dto.aiSecretary;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CorrectionRequestDto {

    @NotBlank(message = "사원번호는 필수입니다.")
    private String empNo;

    @NotBlank(message = "교정할 문장은 필수입니다.")
    private String text;

    // BASIC / BUSINESS_POLITE / CONCISE / LOGICAL / FRIENDLY
    private String mode;
}