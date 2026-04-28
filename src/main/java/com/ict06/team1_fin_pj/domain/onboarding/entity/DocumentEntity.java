package com.ict06.team1_fin_pj.domain.onboarding.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "DOCUMENT")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentEntity extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "doc_id")
    private Integer docId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id")
    private DepartmentEntity department;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_level", nullable = false, length = 30)
    private AccessLevel accessLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_stage", length = 20)
    @Builder.Default
    private DocumentStage currentStage = DocumentStage.UPLOADED;

    // 문서 → 청크들
    @OneToMany(mappedBy = "document", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DocChunkEntity> chunks = new ArrayList<>();

    public void addChunk(DocChunkEntity chunk) {
        this.chunks.add(chunk);
        chunk.setDocument(this);
    }
}