package com.ict06.team1_fin_pj.common.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class OnboardingResponseDto {
    private Integer roadmapId;
    private String title;
    private List<RoadmapItemDto> items;
}
