package com.ict06.team1_fin_pj.common.dto.onboarding;

import com.ict06.team1_fin_pj.domain.onboarding.entity.DocumentStage;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DocumentProcessingResultDto {

    private boolean success;
    private String message;
    private DocumentStage stage;
    private Integer chunkCount;
    private Integer vectorCount;
}
