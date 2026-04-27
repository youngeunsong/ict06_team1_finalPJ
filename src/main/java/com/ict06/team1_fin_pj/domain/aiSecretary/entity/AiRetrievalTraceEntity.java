package com.ict06.team1_fin_pj.domain.aiSecretary.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.DocChunkEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.DocumentEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "AI_CHAT_SESSION")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRetrievalTraceEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trace_id")
    private Integer traceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "log_id", nullable = false)
    private AiLogEntity log;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doc_id", nullable = false)
    private DocumentEntity document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chunk_id", nullable = false)
    private DocChunkEntity chunk;

    @Column(name = "similarity_score", precision = 6, scale = 4)
    private BigDecimal similarityScore;

    @Column(name = "rerank_score", precision = 6, scale = 4)
    private BigDecimal rerankScore;

    @Builder.Default
    @Column(name = "used_in_answer_yn")
    private Boolean usedInAnswer = true;
}
