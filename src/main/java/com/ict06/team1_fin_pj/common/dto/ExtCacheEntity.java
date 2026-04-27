package com.ict06.team1_fin_pj.common.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "EXT_CACHE")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtCacheEntity extends BaseTimeEntity {

    @Id
    @Column(name = "cache_key", length = 100)
    private String cacheKey;

    @Column(name = "cache_data", columnDefinition = "jsonb", nullable = false)
    private String cacheData;
}
