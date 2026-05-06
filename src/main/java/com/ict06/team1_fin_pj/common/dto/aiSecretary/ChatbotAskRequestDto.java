package com.ict06.team1_fin_pj.common.dto.aiSecretary;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ChatbotAskRequestDto {

    @NotNull(message = "sessionId는 필수입니다.")
    private Integer sessionId;

    @NotBlank(message = "질문 내용은 필수입니다.")
    private String content;
}