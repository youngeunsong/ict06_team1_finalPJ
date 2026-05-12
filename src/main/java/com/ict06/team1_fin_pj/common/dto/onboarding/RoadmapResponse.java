/**
 * @FileName : RoadmapResponse.java
 * @Description : 사원별 온보딩 로드맵 응답 DTO
 *                - 프론트에서 사용하는 recommended_roadmap 구조 반환
 *                - 카테고리별 그룹 목록 포함
 * @Author : 김다솜
 * @Date : 2026. 05. 02
 */

package com.ict06.team1_fin_pj.common.dto.onboarding;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class RoadmapResponse  {

    private List<RoadmapGroupResponse> recommended_roadmap;
}