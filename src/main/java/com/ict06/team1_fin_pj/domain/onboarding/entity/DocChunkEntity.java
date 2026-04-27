package com.ict06.team1_fin_pj.domain.onboarding.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DOC_CHUNKS",
       uniqueConstraints = {
            @UniqueConstraint(
                name = "uk_doc_chunk_no",
                columnNames = {"doc_id", "chunk_no"}
            )
       }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocChunkEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chunk_id")
    private Integer chunkId;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doc_id", nullable = false)
    private DocumentEntity document;

    @Column(name = "chunk_no")
    private Integer chunkNo;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "token_count")
    private Integer tokenCount;

    @Column(name = "section_title", length = 200)
    private String sectionTitle;

    // 청크 → 벡터 (1:1)
    @OneToOne(mappedBy = "chunk", cascade = CascadeType.ALL, orphanRemoval = true)
    private DocVectorEntity vector;

    public void setVector(DocVectorEntity vector) {
        this.vector = vector;
        if (vector != null) {
            vector.setChunk(this);
        }
    }
}
