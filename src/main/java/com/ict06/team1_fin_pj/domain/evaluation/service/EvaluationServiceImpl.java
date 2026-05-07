/**
 * @FileName : EvaluationServiceImpl.java
 * @Description : 온보딩 퀴즈 평가 Service 구현 클래스
 *                - 학습 카테고리별 퀴즈 문항 조회
 *                - 객관식 자동 채점 및 주관식(단답형/서술형) AI 채점 확장 기반 처리
 *                - 문항별 응답 결과를 QUIZ_RESULT 테이블에 저장
 *                - 카테고리별 총점, 만점, 통과 여부 계산
 * @Author : 김다솜
 * @Date : 2026. 04. 30
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.30    김다솜        최초 생성 및 퀴즈 조회/제출/채점 로직 구현
 * @ 2026.05.01    김다솜        콘텐츠별 평가에서 카테고리별 평가 구조로 수정
 * @ 2026.05.02    김다솜        카테고리별 평가 결과 집계 로직 추가
 */

package com.ict06.team1_fin_pj.domain.evaluation.service;

import com.ict06.team1_fin_pj.common.dto.evaluation.*;
import com.ict06.team1_fin_pj.domain.auth.repository.EmpRepository;
import com.ict06.team1_fin_pj.domain.employee.entity.EmpEntity;
import com.ict06.team1_fin_pj.domain.evaluation.entity.QuestionType;
import com.ict06.team1_fin_pj.domain.evaluation.entity.QuizQuestionEntity;
import com.ict06.team1_fin_pj.domain.evaluation.entity.QuizResultEntity;
import com.ict06.team1_fin_pj.domain.evaluation.repository.EvaluationQuestionRepository;
import com.ict06.team1_fin_pj.domain.evaluation.repository.EvaluationResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationServiceImpl {

    private final EvaluationQuestionRepository questionRepository;
    private final EvaluationResultRepository resultRepository;
    private final EmpRepository empRepository;

    //학습 카테고리별 퀴즈 문항 조회
    public List<EvaluationQuestionResponse> getQuizQuestionsByCategory(String categoryName) {
        return questionRepository.findByCategoryName(categoryName)
                .stream()
                .map(question -> EvaluationQuestionResponse.builder()
                        .questionId(question.getQuestionId())
                        .contentId(
                                question.getContent() != null
                                ? question.getContent().getContentId()
                                        : null
                        )
                        .categoryName(question.getCategoryName())
                        .questionType(question.getQuestionType())
                        .questionText(question.getQuestionText())
                        .option1(question.getOption1())
                        .option2(question.getOption2())
                        .option3(question.getOption3())
                        .option4(question.getOption4())
                        .score(question.getScore())
                        .build()
                )
                .toList();
    }

    // 채점 및 결과 저장
    // 객관식: 정답 번호 비교로 자동 채점
    // 주관식(단답형/서술형): 현재 미채점 처리(AI 채점 확장 예정)
    // 문항별 결과 QUIZ_RESULT 테이블에 저장 -> 카테고리 기준 총점 및 만점 계산 후 통과 여부 반환
    public EvaluationSubmitResponse submitQuiz(EvaluationSubmitRequest request) {
        if (request.getAnswers() == null || request.getAnswers().isEmpty()) {
            throw new RuntimeException("제출된 답안이 없습니다.");
        }

        EmpEntity emp = empRepository.findByEmpNo(request.getEmpNo())
                .orElseThrow(() -> new RuntimeException("사원 없음"));

        int totalScore = 0;
        int maxScore = 0;

        List<EvaluationAnswerResult> results = new ArrayList<>();

        for (EvaluationAnswerRequest answer : request.getAnswers()) {
            QuizQuestionEntity question = questionRepository.findById(answer.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("문항 없음"));

            if (!question.getCategoryName().equals(request.getCategoryName())) {
                throw new RuntimeException("요청한 카테고리와 문항의 카테고리가 일치하지 않습니다.");
            }

            if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE
                    && answer.getSelectedNo() == null) {
                throw new RuntimeException("객관식 문항의 선택 번호가 없습니다.");
            }

            Boolean isCorrect = null;
            Integer score = 0;
            QuizResultEntity result;

            //1. 객관식 채점
            if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
                isCorrect = question.getAnswerNo().equals(answer.getSelectedNo());
                score = Boolean.TRUE.equals(isCorrect) ? question.getScore() : 0;

                result = QuizResultEntity.builder()
                        .employee(emp)
                        .question(question)
                        .selectedNo(null)
                        .answerText(null)
                        .isCorrect(isCorrect)
                        .score(score)
                        .submittedAt(LocalDateTime.now())
                        .build();
            }
            // 2. 주관식(단답형/서술형) 자동 채점: 추후 FastAPI AI 채점 연동
            // aiScore, aiFeedback, similarityScore 저장 예정
            else if (question.getQuestionType() == QuestionType.SHORT_ANSWER
                    || question.getQuestionType() == QuestionType.ESSAY) {

                isCorrect = null;
                score = 0;

                try {
                    RestTemplate restTemplate = new RestTemplate();

                    String url = "http://localhost:8000/api/ai/evaluation/evaluate";

                    Map<String, String> body = Map.of(
                            "user_answer", answer.getAnswerText(),
                            "reference_answer", question.getSampleAnswer()
                    );

                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);

                    HttpEntity<Map<String, String>> requestEntity =
                            new HttpEntity<>(body, headers);

                    ResponseEntity<Map> response = restTemplate.postForEntity(
                            url,
                            requestEntity,
                            Map.class
                    );

                    Map res = response.getBody();

                    Double aiScore = ((Number) res.get("score")).doubleValue();
                    String aiFeedback = (String) res.get("feedback");
                    Double similarity = ((Number) res.get("similarity")).doubleValue();

                    result = QuizResultEntity.builder()
                            .employee(emp)
                            .question(question)
                            .selectedNo(answer.getSelectedNo())
                            .answerText(answer.getAnswerText())
                            .isCorrect(null)
                            .score(0)
                            .aiScore(BigDecimal.valueOf(aiScore))
                            .aiFeedback(aiFeedback)
                            .similarityScore(BigDecimal.valueOf(similarity))
                            .submittedAt(LocalDateTime.now())
                            .build();
                } catch (Exception e) {
                    System.out.println("AI 서버 호출 실패: " + e.getMessage());

                    // 실패 시 fallback
                    result = QuizResultEntity.builder()
                            .employee(emp)
                            .question(question)
                            .selectedNo(answer.getSelectedNo())
                            .answerText(answer.getAnswerText())
                            .isCorrect(null)
                            .score(0)
                            .submittedAt(LocalDateTime.now())
                            .build();
                }

            } else {
                throw new RuntimeException("지원하지 않는 문항 유형입니다.");
            }

            totalScore += score;
            maxScore += question.getScore();

            resultRepository.save(result);

            // 응답용 결과
            results.add(EvaluationAnswerResult.builder()
                    .questionId(question.getQuestionId())
                    .isCorrect(isCorrect)
                    .score(score)
                    .explanation(question.getExplanation())
                    .build());

        }

        // PASS: 80점 기준
        boolean passed = totalScore >= (maxScore * 0.8);

        return EvaluationSubmitResponse.builder()
                .empNo(request.getEmpNo())
                .categoryName(request.getCategoryName())
                .totalScore(totalScore)
                .maxScore(maxScore)
                .passed(passed)
                .results(results)
                .build();
    }

    // 사번 기준으로 카테고리별 퀴즈 평가 결과 조회
    // @param empNo 사번
    // @return 카테고리별 평가 결과 리스트
    public List<EvaluationCategoryResultResponse> getEvaluationResults(String empNo) {
        // 1. 해당 사원의 전체 퀴즈 결과 조회
        List<QuizResultEntity> results = resultRepository.findByEmployee_EmpNo(empNo);

        // 2. 카테고리 기준으로 결과 그룹화
        Map<String, List<QuizResultEntity>> grouped = results.stream()
                // 문제 정보 없는 경우 제외
                .filter(r -> r.getQuestion() != null)
                // 카테고리 없는 경우 제외
                .filter(r -> r.getQuestion().getCategoryName() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getQuestion().getCategoryName()
                ));

        // 3. 카테고리별 점수 집계 및 결과 생성
        return grouped.entrySet().stream()
                .map(entry -> {
                    String category = entry.getKey();
                    List<QuizResultEntity> list = entry.getValue();

                    // 3-1. 총점 계산(사용자 획득 점수)
                    int totalScore = list.stream()
                            .mapToInt(r -> r.getScore() == null ? 0 : r.getScore())
                                    .sum();

                    // 3-2. 만점 계산(문항 점수 기준)
                    int maxScore = list.stream()
                            .mapToInt(r -> r.getQuestion().getScore() == null ? 0 : r.getQuestion().getScore())
                            .sum();

                    // 3-3. 통과 여부 판단(80점 기준)
                    boolean passed = maxScore > 0 && totalScore >= maxScore * 0.8;

                    // 3-4. 결과 DTO 생성
                    return EvaluationCategoryResultResponse.builder()
                            .categoryName(category)
                            .totalScore(totalScore)
                            .maxScore(maxScore)
                            .submitted(true)
                            .passed(passed)
                            .build();
                })
                .toList();
    }
}