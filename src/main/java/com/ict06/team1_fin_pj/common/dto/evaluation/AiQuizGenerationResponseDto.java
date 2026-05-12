/**
 * @FileName : AiQuizGenerationResponseDto.java
 * @Description : AI 서버 퀴즈 자동 생성 응답 DTO
 * @Author : 김다솜
 * @Date : 2026. 05. 11
 * @Modification_History
 * @
 * @ 수정일자        수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.11    김다솜        생성된 문제 초안 목록 응답 DTO 추가
 */
package com.ict06.team1_fin_pj.common.dto.evaluation;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class AiQuizGenerationResponseDto {

    private List<AdminQuizDraftDto> questions = new ArrayList<>();
}
