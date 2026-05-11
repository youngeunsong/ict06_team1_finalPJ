package com.ict06.team1_fin_pj.common.dto.onboarding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiDocumentProcessRequestDto {

    private Integer docId;
    private String title;
    private String filePath;
}
