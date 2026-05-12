package com.ict06.team1_fin_pj.common.dto.onboarding;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class AiDocumentProcessResponseDto {

    private String status;
    private String sourceType;
    private String extractedTextPreview;
    private Integer chunkCount;
    private Integer vectorCount;
    private String embeddingModel;
    private List<AiDocumentChunkResponseDto> chunks = new ArrayList<>();
}
