/**
 * @FileName : QuizService.java
 * @Description : 온보딩 퀴즈 평가 Service 구현체
 *                - 학습 카테고리별 퀴즈 문항 조회
 *                - 객관식 자동 채점 및 주관식/서술형 AI 채점 확장 기반 처리
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
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    //퀴즈 답안 제출 및 채점
    public EvaluationSubmitResponse submitQuiz(EvaluationSubmitRequest request) {
        if (request.getAnswers() == null || request.getAnswers().isEmpty()) {
            throw new RuntimeException("제출된 답안이 없습니다.");
        }

        EmpEntity emp = empRepository.findByEmpNo(request.getEmpNo())
                .orElseThrow(() -> new RuntimeException("사원 없음"));

        int totalScore = 0;
        int maxScore = 0;

        List<EvaluationAnswerResult> results = new ArrayList<>();

        for(EvaluationAnswerRequest answer : request.getAnswers()) {
            QuizQuestionEntity question = questionRepository.findById(answer.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("문항 없음"));

            if(!question.getCategoryName().equals(request.getCategoryName())) {
                throw new RuntimeException("요청한 카테고리와 문항의 카테고리가 일치하지 않습니다.");
            }

            if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE
                    && answer.getSelectedNo() == null) {
                throw new RuntimeException("객관식 문항의 선택 번호가 없습니다.");
            }

            Boolean isCorrect = null;
            Integer score = 0;

            //1. 객관식 채점
            if(question.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
                isCorrect = question.getAnswerNo().equals(answer.getSelectedNo());
                score = Boolean.TRUE.equals(isCorrect) ? question.getScore() : 0;
            }

            // 2. 단답형/서술형 자동 채점: 추후 AI 채점 연동 예정

            totalScore += score;
            maxScore += question.getScore();

            // 결과 저장
            QuizResultEntity result = QuizResultEntity.builder()
                    .employee(emp)
                    .question(question)
                    .selectedNo(answer.getSelectedNo())
                    .answerText(answer.getAnswerText())
                    .isCorrect(isCorrect)
                    .score(score)
                    .submittedAt(LocalDateTime.now())
                    .build();

            resultRepository.save(result);

            // 응답용 결과
            results.add(EvaluationAnswerResult.builder()
                    .questionId(question.getQuestionId())
                    .isCorrect(isCorrect)
                    .score(score)
                    .explanation(question.getExplanation())
                    .build());

        }

        // PASS: 60점 기준
        boolean passed = totalScore >= (maxScore * 0.6);

        return EvaluationSubmitResponse.builder()
                .empNo(request.getEmpNo())
                .categoryName(request.getCategoryName())
                .totalScore(totalScore)
                .maxScore(maxScore)
                .passed(passed)
                .results(results)
                .build();
    }
}