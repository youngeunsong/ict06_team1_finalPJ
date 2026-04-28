package com.ict06.team1_fin_pj.domain.onboarding.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "DOC_VECTOR",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_chunk_vector",
                        columnNames = {"vector_id", "chunk_id"}
                )
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocVectorEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vector_id")
    private Integer vectorId;

    @Setter
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chunk_id", nullable = false)
    private DocChunkEntity chunk;

    // pgvector → JPA 기본 지원 X → String or float[]로 매핑
    //@Column(name = "embedding_data", columnDefinition = "vector(1536)")
    @Column(name = "embedding_data", columnDefinition = "TEXT")
    private String embeddingData;

    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName;

    @Column
    @Builder.Default
    private Integer dimension = 1536;
}
