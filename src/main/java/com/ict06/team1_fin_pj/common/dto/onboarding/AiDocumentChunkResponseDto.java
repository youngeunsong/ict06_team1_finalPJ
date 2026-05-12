package com.ict06.team1_fin_pj.common.dto.onboarding;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AiDocumentChunkResponseDto {

    private Integer chunkNo;
    private String content;
    private Integer tokenCount;
    private String sectionTitle;
    private String embeddingData;
    private String modelName;
    private Integer dimension;
}
