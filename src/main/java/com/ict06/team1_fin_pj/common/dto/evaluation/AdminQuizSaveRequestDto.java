/**
 * @FileName : AdminQuizSaveRequestDto.java
 * @Description : 관리자 AI 퀴즈 초안 저장 요청 DTO
 * @Author : 김다솜
 * @Date : 2026. 05. 11
 * @Modification_History
 * @
 * @ 수정일자        수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.11    김다솜        생성된 문제 초안 저장 요청 DTO 추가
 */
package com.ict06.team1_fin_pj.common.dto.evaluation;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminQuizSaveRequestDto {

    private Integer contentId;
    private String generatedQuestionsJson;
}
