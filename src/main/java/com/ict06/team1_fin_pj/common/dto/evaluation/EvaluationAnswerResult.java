/**
 * @FileName : EvaluationAnswerResult.java
 * @Description : 온보딩 퀴즈 문항별 채점 결과 응답 DTO
 *                - 문항별 정답 여부, 획득 점수, 해설, AI 채점 결과를 반환
 *                - EvaluationSubmitResponse의 results 목록 요소로 사용
 * @Author : 김다솜
 * @Date : 2026. 05. 01
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.01    김다솜        최초 생성 및 문항별 결과 DTO 분리
 */

package com.ict06.team1_fin_pj.common.dto.evaluation;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class EvaluationAnswerResult {

    private Integer questionId;
    private Boolean isCorrect;
    private Integer score;
    private String explanation;

    private BigDecimal aiScore;
    private String aiFeedback;
    private BigDecimal similarityScore;
}
