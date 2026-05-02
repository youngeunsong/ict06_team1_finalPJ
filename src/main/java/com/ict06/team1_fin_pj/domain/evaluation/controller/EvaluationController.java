/**
 * @FileName : QuizController.java
 * @Description : 온보딩 퀴즈 평가 API Controller
 *                - 학습 카테고리별 퀴즈 문항 조회
 *                - 퀴즈 답안 일괄 제출 및 채점 요청 처리
 * @Author : 김다솜
 * @Date : 2026. 04. 30
 * @Modification_History
 * @
 * @ 수정일         수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.30    김다솜        최초 생성 및 퀴즈 조회/제출 API 구현
 * @ 2026.05.01    김다솜        카테고리별 퀴즈 조회 및 일괄 제출 구조로 수정
 */

package com.ict06.team1_fin_pj.domain.evaluation.controller;

import com.ict06.team1_fin_pj.common.dto.evaluation.EvaluationQuestionResponse;
import com.ict06.team1_fin_pj.common.dto.evaluation.EvaluationSubmitRequest;
import com.ict06.team1_fin_pj.common.dto.evaluation.EvaluationSubmitResponse;
import com.ict06.team1_fin_pj.domain.evaluation.service.EvaluationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluation")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class EvaluationController {

    private final EvaluationServiceImpl quizService;

    //카테고리별 퀴즈 문항 조회
    @GetMapping("/quiz/category/{categoryName}")
    public ResponseEntity<List<EvaluationQuestionResponse>> getQuizQuestionsByCategory(
            @PathVariable String categoryName) {

        return ResponseEntity.ok(quizService.getQuizQuestionsByCategory(categoryName));
    }

    //퀴즈 답안 제출 및 채점
    @PostMapping("/quiz/submit")
    public ResponseEntity<EvaluationSubmitResponse> submitQuiz(
            @RequestBody EvaluationSubmitRequest request) {

        return ResponseEntity.ok(quizService.submitQuiz(request));
    }
}
