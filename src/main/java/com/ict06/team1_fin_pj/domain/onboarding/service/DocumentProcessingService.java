/**
 * @FileName : DocumentProcessingService.java
 * @Description : 관리자 문서 RAG(Retrieval-Augmented Generation) 처리 Service
 * AI 서버 연동을 통한 본문 추출, 청크 분할 및 벡터 임베딩 자동화
 * @Author : 김다솜
 * @Date : 2026. 05. 11
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.11    김다솜        최초 생성/문서 처리 파이프라인(Chunking->Embedding->Publish) 구현
 * @ 2026.05.12    김다솜        문서 삭제 시 연관된 로그/청크/벡터 데이터 순차 정리 로직 추가
 */

package com.ict06.team1_fin_pj.domain.onboarding.service;

import com.ict06.team1_fin_pj.common.dto.onboarding.AiDocumentChunkResponseDto;
import com.ict06.team1_fin_pj.common.dto.onboarding.AiDocumentProcessRequestDto;
import com.ict06.team1_fin_pj.common.dto.onboarding.AiDocumentProcessResponseDto;
import com.ict06.team1_fin_pj.common.dto.onboarding.DocumentProcessingResultDto;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.DocumentProcessLogEntity;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.ProcessStage;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.ProcessStatus;
import com.ict06.team1_fin_pj.domain.aiSecretary.repository.DocumentProcessLogRepository;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.DocChunkEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.DocVectorEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.DocumentEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.DocumentStage;
import com.ict06.team1_fin_pj.domain.onboarding.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentProcessingService {

    private final DocumentRepository documentRepository;
    private final DocumentProcessLogRepository documentProcessLogRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.server.base-url:http://localhost:8000}")
    private String aiServerBaseUrl;

    public DocumentProcessingResultDto processDocument(Integer docId, EmpEntity processedBy) {
        DocumentEntity document = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));

        document.updateStage(DocumentStage.CHUNKING);
        documentRepository.saveAndFlush(document);

        DocumentProcessLogEntity chunkLog = createLog(document, processedBy, ProcessStage.CHUNK);
        documentProcessLogRepository.saveAndFlush(chunkLog);

        AiDocumentProcessResponseDto response;
        try {
            response = requestDocumentProcessing(document);
            chunkLog.markSuccess();
            documentProcessLogRepository.saveAndFlush(chunkLog);
        } catch (Exception e) {
            String errorMessage = extractRootMessage(e);
            chunkLog.markFail(errorMessage);
            documentProcessLogRepository.saveAndFlush(chunkLog);
            document.updateStage(DocumentStage.CHUNK_FAILED);
            documentRepository.saveAndFlush(document);
            return DocumentProcessingResultDto.builder()
                    .success(false)
                    .message("문서 청크 생성에 실패했습니다: " + errorMessage)
                    .stage(DocumentStage.CHUNK_FAILED)
                    .chunkCount(0)
                    .vectorCount(0)
                    .build();
        }

        document.updateStage(DocumentStage.EMBEDDING);
        documentRepository.saveAndFlush(document);

        DocumentProcessLogEntity embedLog = createLog(document, processedBy, ProcessStage.EMBED);
        documentProcessLogRepository.saveAndFlush(embedLog);

        try {
            document.clearChunks();
            documentRepository.saveAndFlush(document);
            applyChunks(document, response.getChunks());
            document.updateSummaryPreview(response.getExtractedTextPreview());
            document.updateStage(DocumentStage.PUBLISHED);
            documentRepository.saveAndFlush(document);
            embedLog.markSuccess();
            documentProcessLogRepository.saveAndFlush(embedLog);

            int chunkCount = document.getChunks().size();
            int vectorCount = (int) document.getChunks().stream()
                    .filter(chunk -> chunk.getVector() != null)
                    .count();

            return DocumentProcessingResultDto.builder()
                    .success(true)
                    .message("문서 자동 처리가 완료되었습니다.")
                    .stage(DocumentStage.PUBLISHED)
                    .chunkCount(chunkCount)
                    .vectorCount(vectorCount)
                    .build();
        } catch (Exception e) {
            String errorMessage = extractRootMessage(e);
            embedLog.markFail(errorMessage);
            documentProcessLogRepository.saveAndFlush(embedLog);
            document.updateStage(DocumentStage.EMBED_FAILED);
            documentRepository.saveAndFlush(document);
            return DocumentProcessingResultDto.builder()
                    .success(false)
                    .message("임베딩 저장에 실패했습니다: " + errorMessage)
                    .stage(DocumentStage.EMBED_FAILED)
                    .chunkCount(0)
                    .vectorCount(0)
                    .build();
        }
    }

    private AiDocumentProcessResponseDto requestDocumentProcessing(DocumentEntity document) {
        String url = aiServerBaseUrl + "/api/ai/documents/process";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        AiDocumentProcessRequestDto body = AiDocumentProcessRequestDto.builder()
                .docId(document.getDocId())
                .title(document.getTitle())
                .filePath(document.getFilePath())
                .build();

        HttpEntity<AiDocumentProcessRequestDto> entity = new HttpEntity<>(body, headers);
        ResponseEntity<AiDocumentProcessResponseDto> response = restTemplate.postForEntity(
                url,
                entity,
                AiDocumentProcessResponseDto.class
        );

        AiDocumentProcessResponseDto payload = response.getBody();
        if (payload == null || payload.getChunks() == null || payload.getChunks().isEmpty()) {
            throw new IllegalStateException("처리 결과에 저장할 청크가 없습니다.");
        }

        return payload;
    }

    private void applyChunks(DocumentEntity document, List<AiDocumentChunkResponseDto> chunkDtos) {
        for (AiDocumentChunkResponseDto chunkDto : chunkDtos) {
            DocChunkEntity chunk = DocChunkEntity.builder()
                    .chunkNo(chunkDto.getChunkNo())
                    .content(chunkDto.getContent())
                    .tokenCount(chunkDto.getTokenCount())
                    .sectionTitle(chunkDto.getSectionTitle())
                    .build();

            if (chunkDto.getEmbeddingData() != null && !chunkDto.getEmbeddingData().isBlank()) {
                DocVectorEntity vector = DocVectorEntity.builder()
                        .embeddingData(chunkDto.getEmbeddingData())
                        .modelName(chunkDto.getModelName() != null ? chunkDto.getModelName() : "hash-embedding-v1")
                        .dimension(chunkDto.getDimension() != null ? chunkDto.getDimension() : 256)
                        .build();
                chunk.setVector(vector);
            }

            document.addChunk(chunk);
        }
    }

    private DocumentProcessLogEntity createLog(DocumentEntity document, EmpEntity processedBy, ProcessStage stage) {
        return DocumentProcessLogEntity.builder()
                .document(document)
                .stage(stage)
                .status(ProcessStatus.PROCESSING)
                .startedAt(LocalDateTime.now())
                .processedBy(processedBy)
                .build();
    }

    @Transactional
    public void deleteDocument(Integer docId) {
        DocumentEntity document = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));

        documentProcessLogRepository.deleteByDocument_DocId(docId);
        documentProcessLogRepository.flush();

        document.clearChunks();
        documentRepository.saveAndFlush(document);

        documentRepository.delete(document);
        documentRepository.flush();
    }

    private String extractRootMessage(Throwable throwable) {
        Throwable current = throwable;

        while (current.getCause() != null && current.getCause() != current) {
            current = current.getCause();
        }

        return current.getMessage() != null ? current.getMessage() : throwable.getClass().getSimpleName();
    }
}
