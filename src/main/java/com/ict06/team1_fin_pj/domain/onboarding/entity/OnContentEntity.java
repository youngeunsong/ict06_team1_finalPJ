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

    @Column(length = 255)
    private String title;

    // VIDEO, PDF, QUIZ 등 → enum 추천
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ContentType type;

    @Column(length = 500)
    private String path;
}
