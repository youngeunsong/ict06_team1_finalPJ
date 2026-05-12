/**
 * @FileName : AdQuizGenerationRuleRequestDto.java
 * @Description : 관리자 AI 퀴즈 출제 기준 등록/수정 요청 DTO
 * @Author : 김다솜
 * @Date : 2026. 05. 11
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.10    김다솜        최초 생성 및 퀴즈 출제 기준 요청값 추가
 */

package com.ict06.team1_fin_pj.common.dto.evaluation;

import com.ict06.team1_fin_pj.domain.evaluation.entity.QuestionType;
import com.ict06.team1_fin_pj.domain.onboarding.entity.Difficulty;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
public class AdQuizGenerationRuleRequestDto {

    @NotBlank(message = "카테고리명은 필수입니다.")
    private String categoryName;

    @NotNull(message = "문제 수는 필수입니다.")
    @Min(value = 1, message = "문제 수는 최소 1개 이상이어야 합니다.")
    private Integer questionCount;

    @NotNull(message = "합격 점수는 필수입니다.")
    @Min(value = 0, message = "합격 점수는 0점 이상이어야 합니다.")
    private Integer passScore;

    @NotNull(message = "난이도를 선택해주세요.")
    private Difficulty difficulty;

    @NotNull(message = "문제 유형을 선택해주세요.")
    private QuestionType questionType;

    private Boolean isActive = false;
}