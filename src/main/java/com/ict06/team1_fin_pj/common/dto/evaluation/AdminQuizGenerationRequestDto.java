/**
 * @FileName : AdminQuizGenerationRequestDto.java
 * @Description : 관리자 AI 퀴즈 자동 생성 요청 DTO
 * @Author : 김다솜
 * @Date : 2026. 05. 11
 * @Modification_History
 * @
 * @ 수정일자        수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.11    김다솜        콘텐츠, 문항 수, 난이도 기반 퀴즈 생성 요청 DTO 추가
 */
package com.ict06.team1_fin_pj.common.dto.evaluation;

import com.ict06.team1_fin_pj.domain.onboarding.entity.Difficulty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminQuizGenerationRequestDto {

    private Integer contentId;
    private Integer questionCount = 3;
    private Difficulty difficulty = Difficulty.EASY;
}
