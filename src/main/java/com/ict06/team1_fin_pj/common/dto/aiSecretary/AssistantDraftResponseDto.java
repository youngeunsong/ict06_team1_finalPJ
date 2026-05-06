package com.ict06.team1_fin_pj.common.dto.aiSecretary;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AssistantDraftResponseDto {

    private Integer sessionId;

    private Integer userMessageId;

    private Integer aiMessageId;

    private String type;

    private String title;

    private String content;

    private String modelName;

    private Boolean fallback;
}