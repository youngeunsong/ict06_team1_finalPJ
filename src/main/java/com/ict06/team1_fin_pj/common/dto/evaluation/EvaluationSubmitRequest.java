/**
 * @FileName : EvaluationSubmitRequest.java
 * @Description : AI 온보딩 퀴즈 답안 제출 요청 DTO
 *                사번, 문항 ID, 객관식 선택 번호 또는 주관식 답변을 전달
 * @Author : 김다솜
 * @Date : 2026. 04. 30
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.30    김다솜        최초 생성
 * @ 2026.05.01    김다솜        카테고리별 퀴즈 일괄 제출 구조로 수정
 */

package com.ict06.team1_fin_pj.common.dto.evaluation;

import lombok.Getter;

import java.util.List;

@Getter
public class EvaluationSubmitRequest {

    private String empNo;
    private String categoryName;

    private List<EvaluationAnswerRequest> answers;
}
