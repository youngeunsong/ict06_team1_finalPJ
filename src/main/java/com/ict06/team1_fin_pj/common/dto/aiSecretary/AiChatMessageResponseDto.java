// 메시지 응답 DTO
package com.ict06.team1_fin_pj.common.dto.aiSecretary;

import com.ict06.team1_fin_pj.domain.aiSecretary.entity.MessageRole;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AiChatMessageResponseDto {

    private Integer messageId;
    private Integer sessionId;
    private MessageRole role;
    private String content;
    private Integer seqNo;
    private String modelName;
    private Integer promptTokens;
    private Integer completionTokens;
    private LocalDateTime createdAt;

}

/* JSON 예시 - 메시지 저장
   {
     "messageId": 101,
     "sessionId": 5,
     "role": "USER",
     "content": "보고서 초안을 작성해줘",
     "seqNo": 1,
     "modelName": "gpt-4",
     "promptTokens": 150,
     "completionTokens": 300,
     "createdAt": "2024-05-20T14:30:00"
   }
*/

