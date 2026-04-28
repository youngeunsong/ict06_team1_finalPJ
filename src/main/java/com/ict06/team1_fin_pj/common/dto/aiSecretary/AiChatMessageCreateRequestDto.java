// 메시지 생성 요청 DTO
package com.ict06.team1_fin_pj.common.dto.aiSecretary;

import com.ict06.team1_fin_pj.domain.aiSecretary.entity.MessageRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiChatMessageCreateRequestDto {

    @NotNull
    private MessageRole role;

    @NotBlank
    private String content;

    private String modelName;
}

/* JSON 예시 - 메시지 생성 요청
   {
     "role": "USER",
     "content": "오늘 서울 날씨 어때? 점심 메뉴도 추천해줘.",
     "modelName": "gpt-4o"
    }
*/