package com.ict06.team1_fin_pj.common.dto.onboarding;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AiDocumentQuestionResponseDto {

    private String answer;
    private Integer usedChunkCount;
}
