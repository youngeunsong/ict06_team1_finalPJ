package com.ict06.team1_fin_pj.common.dto.aiSecretary;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AssistantReviseResponseDto {

    private Integer sessionId;

    private Integer userMessageId;

    private Integer aiMessageId;

    private String type;

    private String title;

    // 수정된 문서 본문
    private String content;

    private String modelName;

    private Boolean fallback;
}