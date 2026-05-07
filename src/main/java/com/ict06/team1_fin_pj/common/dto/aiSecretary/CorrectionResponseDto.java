package com.ict06.team1_fin_pj.common.dto.aiSecretary;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CorrectionResponseDto {

    private String mode;

    private String correctedText;

    private Boolean fallback;
}