/**
 * @FileName : AdEvaluationServiceImpl.java
 * @Description : 관리자 온보딩 평가 관리 서비스 구현체
 * @Author : 김다솜
 * @Date : 2026. 05. 11
 * @Modification_History
 * @
 * @ 수정일자        수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.11    김다솜        AI 서버 퀴즈 초안 생성 연동 및 생성 문제 저장 로직 추가
 */
package com.ict06.team1_fin_pj.domain.evaluation.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ict06.team1_fin_pj.common.dto.evaluation.AdminQuizDraftDto;
import com.ict06.team1_fin_pj.common.dto.evaluation.AdminQuizGenerationRequestDto;
import com.ict06.team1_fin_pj.common.dto.evaluation.AdminQuizSaveRequestDto;
import com.ict06.team1_fin_pj.common.dto.evaluation.AiQuizGenerationRequestDto;
import com.ict06.team1_fin_pj.common.dto.evaluation.AiQuizGenerationResponseDto;
import com.ict06.team1_fin_pj.domain.evaluation.entity.QuestionType;
import com.ict06.team1_fin_pj.domain.evaluation.entity.QuizQuestionEntity;
import com.ict06.team1_fin_pj.domain.evaluation.repository.EvaluationQuestionRepository;
import com.ict06.team1_fin_pj.domain.onboarding.entity.OnContentEntity;
import com.ict06.team1_fin_pj.domain.onboarding.repository.OnContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdEvaluationServiceImpl implements AdEvaluationService {

    private final OnContentRepository onContentRepository;
    private final EvaluationQuestionRepository evaluationQuestionRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ai.server.base-url:http://localhost:8000}")
    private String aiServerBaseUrl;

    @Override
    // 콘텐츠 기준 AI 퀴즈 초안 생성
    public AiQuizGenerationResponseDto generateQuizDrafts(AdminQuizGenerationRequestDto requestDto) {
        OnContentEntity content = onContentRepository.findById(requestDto.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("선택한 콘텐츠를 찾을 수 없습니다."));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        AiQuizGenerationRequestDto body = AiQuizGenerationRequestDto.builder()
                .contentId(content.getContentId())
                .title(content.getTitle())
                .category(content.getCategory())
                .subCategory(content.getSubCategory())
                .contentType(content.getType() != null ? content.getType().name() : "LINK")
                .difficulty((requestDto.getDifficulty() != null ? requestDto.getDifficulty() : content.getDifficulty()).name())
                .questionCount(requestDto.getQuestionCount() != null ? requestDto.getQuestionCount() : 3)
                .tags(content.getTags())
                .path(content.getPath())
                .build();

        String url = aiServerBaseUrl + "/api/ai/evaluation/generate";
        ResponseEntity<AiQuizGenerationResponseDto> response = restTemplate.postForEntity(
                url,
                new HttpEntity<>(body, headers),
                AiQuizGenerationResponseDto.class
        );

        AiQuizGenerationResponseDto payload = response.getBody();
        if (payload == null || payload.getQuestions() == null || payload.getQuestions().isEmpty()) {
            throw new IllegalStateException("AI가 생성한 문제 초안이 없습니다.");
        }

        return payload;
    }

    @Override
    @Transactional
    // 생성된 퀴즈 초안을 평가 문제로 저장
    public int saveGeneratedQuestions(AdminQuizSaveRequestDto requestDto) {
        OnContentEntity content = onContentRepository.findById(requestDto.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("선택한 콘텐츠를 찾을 수 없습니다."));

        try {
            List<AdminQuizDraftDto> drafts = objectMapper.readValue(
                    requestDto.getGeneratedQuestionsJson(),
                    new TypeReference<>() {
                    }
            );

            List<QuizQuestionEntity> questions = drafts.stream()
                    .map(draft -> QuizQuestionEntity.builder()
                            .content(content)
                            .categoryName(content.getCategory())
                            .questionType(QuestionType.MULTIPLE_CHOICE)
                            .questionText(draft.getQuestionText())
                            .option1(draft.getOption1())
                            .option2(draft.getOption2())
                            .option3(draft.getOption3())
                            .option4(draft.getOption4())
                            .answerNo(draft.getAnswerNo())
                            .score(10)
                            .explanation(draft.getExplanation())
                            .build())
                    .toList();

            evaluationQuestionRepository.saveAll(questions);
            return questions.size();
        } catch (Exception e) {
            throw new IllegalStateException("생성된 문제 저장에 실패했습니다: " + e.getMessage(), e);
        }
    }
}
