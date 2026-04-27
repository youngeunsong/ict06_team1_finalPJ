package com.ict06.team1_fin_pj.common.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RoadmapItemDto {
    private Integer itemId;
    private String title;
    private Integer orderNo;
}
