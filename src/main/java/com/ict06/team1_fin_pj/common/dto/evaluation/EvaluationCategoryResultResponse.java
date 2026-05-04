/**
 * @FileName : EvaluationCategoryResultResponse.java
 * @Description : 카테고리별 평가 결과 조회 응답 DTO
 *                - AI 온보딩 평가 현황 화면에서 카테고리별 응시 상태를 표시
 *                - 총점, 만점, 통과 여부, 응시 여부 정보를 반환
 * @Author : 김다솜
 * @Date : 2026. 05. 02
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.02    김다솜        최초 생성 및 카테고리별 평가 결과 조회 응답 구조 정의
 */

package com.ict06.team1_fin_pj.common.dto.evaluation;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class EvaluationCategoryResultResponse {
    private String categoryName;
    private Integer totalScore;
    private Integer maxScore;
    private Boolean submitted;
    private Boolean passed;
}
