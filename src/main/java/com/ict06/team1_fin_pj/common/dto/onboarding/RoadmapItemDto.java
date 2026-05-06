/**
 * @FileName : RoadmapItemDto.java
 * @Description : 온보딩 로드맵 개별 항목 정보 전달용 DTO
 *                로드맵 아이템의 식별자, 제목, 정렬 순서를 포함함
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성 및 로드맵 항목 데이터 구조 정의
 */

package com.ict06.team1_fin_pj.common.dto.onboarding;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RoadmapItemDto {
    private Integer itemId;
    private String title;
    private Integer orderNo;
}
