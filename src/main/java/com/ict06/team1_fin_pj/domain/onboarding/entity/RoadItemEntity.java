/**
 * @FileName : RoadItemEntity.java
 * @Description : 온보딩 로드맵 아이템 Entity
 * @Author : 김다솜
 * @Date : 2026. 04. 29
 * @Modification_History
 * @
 * @ 수정일자        수정자       수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.29    김다솜        최초 생성
 * @ 2026.05.10    김다솜        관리자 아이템 수정/순서 변경 및 일정 시작일/마감일 필드 추가
 */
package com.ict06.team1_fin_pj.domain.onboarding.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(
        name = "ROAD_ITEM",
        indexes = {
                @Index(name = "idx_roadmap_order", columnList = "roadmap_id, order_no")
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoadItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Integer itemId;

    @Column(name = "item_title", length = 200)
    private String itemTitle;

    @Column(name = "recommendation_reason", length = 300)
    private String recommendationReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private RoadmapEntity roadmap;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private OnContentEntity content;

    @Column(name = "category_name", length = 50, nullable = false)
    private String categoryName;

    @Column(name = "order_no", nullable = false)
    private Integer orderNo;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    public void updateRoadItem(
            OnContentEntity content,
            String itemTitle,
            String recommendationReason,
            String categoryName,
            Integer orderNo,
            LocalDate startDate,
            LocalDate dueDate
    ) {
        this.content = content;
        this.itemTitle = itemTitle;
        this.recommendationReason = recommendationReason;
        this.categoryName = categoryName;
        this.orderNo = orderNo;
        this.startDate = startDate;
        this.dueDate = dueDate;
    }

    public void updateOrderNo(Integer orderNo) {
        this.orderNo = orderNo;
    }
}
