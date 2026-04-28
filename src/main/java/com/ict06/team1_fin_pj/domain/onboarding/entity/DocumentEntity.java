// 원본 문서
package com.ict06.team1_fin_pj.domain.onboarding.entity;

import com.ict06.team1_fin_pj.common.dto.BaseTimeEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.DepartmentEntity;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
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
    private Integer docId; // 문서 마스터 식별자

    @Column(nullable = false, length = 255)
    private String title; // 문서 제목

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath; // 원본 파일 저장 경로

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id")
    private DepartmentEntity department; // 담당 부서

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private EmpEntity createdBy; // 생성자 사번

    @Enumerated(EnumType.STRING)
    @Column(name = "access_level", nullable = false, length = 30)
    private AccessLevel accessLevel; // 접근 권한 등급

    @Enumerated(EnumType.STRING)
    @Column(name = "current_stage", length = 20)
    @Builder.Default
    private DocumentStage currentStage = DocumentStage.UPLOADED; // 현재 처리 단계

    // 문서 → 청크들
    @OneToMany(mappedBy = "document", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DocChunkEntity> chunks = new ArrayList<>();

    public void addChunk(DocChunkEntity chunk) {
        this.chunks.add(chunk);
        chunk.setDocument(this);
    }
}