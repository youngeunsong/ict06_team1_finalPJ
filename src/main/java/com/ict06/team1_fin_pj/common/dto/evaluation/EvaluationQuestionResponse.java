/**
 * @FileName : QuizQuestionResponse.java
 * @Description : 온보딩 퀴즈 문항 조회 응답 DTO
 *                - 카테고리별 퀴즈 문항 정보를 화면에 전달
 *                - 문제 내용, 보기, 배점 정보를 포함하며 정답 정보는 제외
 * @Author : 김다솜
 * @Date : 2026. 04. 30
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.30    김다솜        최초 생성
 * @ 2026.05.01    김다솜        콘텐츠 기준 조회에서 카테고리 기준 조회 구조로 수정
 */

package com.ict06.team1_fin_pj.common.dto.evaluation;

import com.ict06.team1_fin_pj.domain.evaluation.entity.QuestionType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EvaluationQuestionResponse {

    private Integer questionId;
    private Integer contentId;
    private String categoryName;
    private QuestionType questionType;
    private String questionText;

    private String option1;
    private String option2;
    private String option3;
    private String option4;

    private Integer score;
}
