/**
 * @FileName : AdminQuizDraftDto.java
 * @Description : 관리자 AI 퀴즈 자동 생성 초안 DTO
 * @Author : 김다솜
 * @Date : 2026. 05. 11
 * @Modification_History
 * @
 * @ 수정일자        수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.11    김다솜        생성된 객관식 문제 초안 표시용 DTO 추가
 */
package com.ict06.team1_fin_pj.common.dto.evaluation;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminQuizDraftDto {

    private String questionText;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private Integer answerNo;
    private String explanation;
}
