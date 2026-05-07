// 세션(대화방) 생성 DTO
package com.ict06.team1_fin_pj.common.dto.aiSecretary;

import com.ict06.team1_fin_pj.domain.aiSecretary.entity.SessionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatSessionCreateRequestDto {
    @NotBlank
    private String empNo;

    @NotNull
    private SessionType sessionType;

    @NotBlank
    private String title;
}

/* JSON 예시 - 세션 생성
  {
  "empNo": "20260001",
  "sessionType": "ASSISTANT",
  "title": "보고서 초안 대화방"
  }
*/