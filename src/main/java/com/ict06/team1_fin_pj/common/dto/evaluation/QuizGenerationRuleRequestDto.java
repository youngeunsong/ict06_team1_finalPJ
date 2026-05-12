/**
 * @FileName : QuizGenerationRuleRequestDto.java
 * @Description : 관리자 AI 퀴즈 출제 기준 등록/수정 요청 DTO
 * @Author : 김다솜
 * @Date : 2026. 05. 10
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

@Getter
@Setter
public class QuizGenerationRuleRequestDto {

    private String categoryName;
    private Integer questionCount;
    private Integer passScore;
    private Difficulty difficulty;
    private QuestionType questionType;
    private Boolean isActive = false;
}
