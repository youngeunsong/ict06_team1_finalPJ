package com.ict06.team1_fin_pj.domain.onboarding.service;

import com.ict06.team1_fin_pj.common.dto.onboarding.AiDocumentQuestionRequestDto;
import com.ict06.team1_fin_pj.common.dto.onboarding.AiDocumentQuestionResponseDto;
import com.ict06.team1_fin_pj.domain.onboarding.entity.DocChunkEntity;
import com.ict06.team1_fin_pj.domain.onboarding.entity.DocumentEntity;
import com.ict06.team1_fin_pj.domain.onboarding.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentQuestionAnswerService {

    private static final int MAX_CONTEXT_CHUNKS = 5;

    private final DocumentRepository documentRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.server.base-url:http://localhost:8000}")
    private String aiServerBaseUrl;

    public AiDocumentQuestionResponseDto answerQuestion(Integer docId, String question) {
        DocumentEntity document = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다."));

        String normalizedQuestion = question == null ? "" : question.trim();
        if (normalizedQuestion.isBlank()) {
            throw new IllegalArgumentException("질문 내용을 입력해 주세요.");
        }

        List<String> selectedChunks = selectRelevantChunks(document, normalizedQuestion);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        AiDocumentQuestionRequestDto requestDto = AiDocumentQuestionRequestDto.builder()
                .title(document.getTitle())
                .question(normalizedQuestion)
                .summaryPreview(document.getSummaryPreview())
                .chunks(selectedChunks)
                .build();

        HttpEntity<AiDocumentQuestionRequestDto> entity = new HttpEntity<>(requestDto, headers);
        ResponseEntity<AiDocumentQuestionResponseDto> response = restTemplate.postForEntity(
                aiServerBaseUrl + "/api/ai/documents/answer",
                entity,
                AiDocumentQuestionResponseDto.class
        );

        AiDocumentQuestionResponseDto payload = response.getBody();
        if (payload == null || payload.getAnswer() == null || payload.getAnswer().isBlank()) {
            throw new IllegalStateException("문서 답변 생성 결과가 비어 있습니다.");
        }

        return payload;
    }

    private List<String> selectRelevantChunks(DocumentEntity document, String question) {
        List<DocChunkEntity> chunks = document.getChunks().stream()
                .sorted(Comparator.comparing(DocChunkEntity::getChunkNo))
                .toList();

        if (chunks.isEmpty()) {
            throw new IllegalArgumentException("문서 청크가 없어 질문응답을 생성할 수 없습니다. 먼저 재처리를 진행해 주세요.");
        }

        Set<String> questionTerms = extractTerms(question);
        List<String> matchedChunks = chunks.stream()
                .sorted(Comparator
                        .comparingInt((DocChunkEntity chunk) -> scoreChunk(chunk.getContent(), questionTerms))
                        .reversed()
                        .thenComparing(DocChunkEntity::getChunkNo))
                .limit(MAX_CONTEXT_CHUNKS)
                .map(DocChunkEntity::getContent)
                .toList();

        if (matchedChunks.stream().allMatch(String::isBlank)) {
            return chunks.stream()
                    .limit(MAX_CONTEXT_CHUNKS)
                    .map(DocChunkEntity::getContent)
                    .toList();
        }

        return matchedChunks;
    }

    private int scoreChunk(String content, Set<String> questionTerms) {
        if (content == null || content.isBlank() || questionTerms.isEmpty()) {
            return 0;
        }

        String normalizedContent = content.toLowerCase(Locale.ROOT);
        int score = 0;
        for (String term : questionTerms) {
            if (normalizedContent.contains(term)) {
                score += Math.max(term.length(), 1);
            }
        }
        return score;
    }

    private Set<String> extractTerms(String text) {
        return List.of(text.toLowerCase(Locale.ROOT).split("[^0-9a-zA-Z가-힣]+")).stream()
                .map(String::trim)
                .filter(term -> term.length() >= 2)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
