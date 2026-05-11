/**
 * @FileName : RoadmapItemResponse.java
 * @Description : 온보딩 로드맵 아이템 응답 DTO
 *                - 학습 콘텐츠 정보와 진행 상태를 포함
 *                - 프론트엔드 MyRoadmap.js에서 직접 사용
 * @Author : 김다솜
 * @Date : 2026. 05. 02
 * @Modification_History
 * @
 * @ 수정일자        수정자       수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.02    김다솜        최초 생성
 * @ 2026.05.10    김다솜        로드맵 아이템 일정 시작일/마감일 응답값 추가
 */
package com.ict06.team1_fin_pj.common.dto.onboarding;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class RoadmapItemResponse {

    private Integer item_id;
    private Integer content_id;
    private String item_title;
    private String recommendation_reason;
    private String category_name;
    private Integer order_no;
    private LocalDate start_date;
    private LocalDate due_date;

    private String status;
    private BigDecimal rate;
}
