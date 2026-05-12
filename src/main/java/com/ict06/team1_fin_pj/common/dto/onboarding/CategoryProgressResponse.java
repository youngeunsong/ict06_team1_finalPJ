package com.ict06.team1_fin_pj.common.dto.onboarding;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoryProgressResponse {
    private String categoryName;
    private Integer totalLearningCount;
    private Integer completedLearningCount;
    private Integer progressPercent;
}
