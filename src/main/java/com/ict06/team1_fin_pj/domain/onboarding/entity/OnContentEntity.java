package com.ict06.team1_fin_pj.domain.onboarding.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ON_CONTENT")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnContentEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "content_id")
    private Integer contentId;

    @Column(length = 255, nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private ContentType type;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "sub_category", length = 50)
    private String subCategory;

    @Column(name = "target_position", length = 50)
    private String targetPosition;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", length = 20, nullable = false)
    private Difficulty difficulty;

    @Column(name = "estimated_time")
    private Integer estimatedTime;

    @Column(name = "tags", columnDefinition = "jsonb")
    private String tags;

    @Builder.Default
    @Column(name = "is_mandatory")
    private Boolean isMandatory = false;

    @Column(length = 500)
    private String path;
}
