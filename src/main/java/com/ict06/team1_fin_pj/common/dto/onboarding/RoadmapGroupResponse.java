/**
 * @FileName : RoadmapGroupResponse.java
 * @Description : 온보딩 로드맵 카테고리 그룹 응답 DTO
 *                - 카테고리별 아이템 리스트 포함
 * @Author : 김다솜
 * @Date : 2026. 05. 02
 */


package com.ict06.team1_fin_pj.common.dto.onboarding;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class RoadmapGroupResponse {

    private String category_name;
    private List<RoadmapItemResponse> items;
}
