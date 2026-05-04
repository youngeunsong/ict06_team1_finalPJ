/**
 * @FileName : EvaluationAnswerRequest.java
 * @Description : 온보딩 퀴즈 문항별 답안 요청 DTO
 *                - 각 문항 ID, 객관식 선택 번호, 주관식 답변 내용을 전달
 *                - EvaluationSubmitRequest의 answers 목록 요소로 사용
 * @Author : 김다솜
 * @Date : 2026. 05. 01
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.01    김다솜        최초 생성 및 문항별 답안 DTO 분리
 */

package com.ict06.team1_fin_pj.common.dto.evaluation;

import lombok.Getter;

@Getter
public class EvaluationAnswerRequest {
    private Integer questionId;
    private Integer selectedNo;
    private String answerText;
}
