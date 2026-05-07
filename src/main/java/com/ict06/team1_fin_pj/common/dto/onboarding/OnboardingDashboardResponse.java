/**
 * @FileName : OnboardingDashboardResponse.java
 * @Description : 온보딩 대시보드 요약 응답 DTO
 *                - 전체 학습 진행률
 *                - 완료 교육 수
 *                - 평가 응시 수
 *                - 평가 통과 수
 *                - 평균 평가 점수 반환
 * @Author : 김다솜
 * @Date : 2026. 05. 06
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.06    김다솜        최초 생성 및 온보딩 대시보드 요약 응답 구조 정의
 */

package com.ict06.team1_fin_pj.common.dto.onboarding;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class OnboardingDashboardResponse {

    private Integer totalLearningCount;
    private Integer completedLearningCount;
    private Integer totalCategoryCount;
    private Integer completedCategoryCount;
    private Integer learningProgressPercent;

    private Integer submittedEvaluationCount;
    private Integer passedEvaluationCount;
    private Integer evaluationPassRatePercent;
    private List<CategoryProgressResponse> categoryProgresses;
}
