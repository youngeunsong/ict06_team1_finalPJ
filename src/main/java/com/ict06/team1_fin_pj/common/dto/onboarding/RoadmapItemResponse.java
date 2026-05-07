/**
 * @FileName : RoadmapItemResponse.java
 * @Description : 온보딩 로드맵 아이템 응답 DTO
 *                - 학습 콘텐츠 정보 + 진행 상태 포함
 *                - 프론트(MyRoadmap.js)에서 직접 사용
 * @Author : 김다솜
 * @Date : 2026. 05. 02
 */

package com.ict06.team1_fin_pj.common.dto.onboarding;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class RoadmapItemResponse {

    private Integer item_id;
    private Integer content_id;
    private String item_title;
    private String category_name;
    private Integer order_no;

    private String status;
    private BigDecimal rate;
}
