/**
 * @FileName : AdEvaluationController.java
 * @Description : 관리자 온보딩 평가 관리 컨트롤러
 * @Author : 김다솜
 * @Date : 2026. 04. 24
 * @Modification_History
 * @
 * @ 수정일자        수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.04.24    김다솜        최초 생성
 * @ 2026.05.10    김다솜        AI 퀴즈 출제 기준 목록/등록/수정/삭제 관리 기능 추가
 * @ 2026.05.11    김다솜        AI 퀴즈 자동 생성, 평가 문제 목록, 저장 후 목록 이동 기능 추가
 */
package com.ict06.team1_fin_pj.domain.evaluation.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ict06.team1_fin_pj.common.dto.evaluation.AdminQuizGenerationRequestDto;
import com.ict06.team1_fin_pj.common.dto.evaluation.AdminQuizSaveRequestDto;
import com.ict06.team1_fin_pj.common.dto.evaluation.AiQuizGenerationResponseDto;
import com.ict06.team1_fin_pj.common.dto.evaluation.AdQuizGenerationRuleRequestDto;
import com.ict06.team1_fin_pj.domain.evaluation.entity.QuestionType;
import com.ict06.team1_fin_pj.domain.evaluation.entity.QuizGenerationRuleEntity;
import com.ict06.team1_fin_pj.domain.evaluation.repository.EvaluationQuestionRepository;
import com.ict06.team1_fin_pj.domain.evaluation.repository.QuizGenerationRuleRepository;
import com.ict06.team1_fin_pj.domain.evaluation.service.AdEvaluationService;
import com.ict06.team1_fin_pj.domain.onboarding.entity.Difficulty;
import com.ict06.team1_fin_pj.domain.onboarding.entity.OnContentEntity;
import com.ict06.team1_fin_pj.domain.onboarding.repository.OnContentRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.util.List;

@Controller
@RequestMapping("/admin/evaluation")
@RequiredArgsConstructor
public class AdEvaluationController {

    private final QuizGenerationRuleRepository quizGenerationRuleRepository;
    private final EvaluationQuestionRepository evaluationQuestionRepository;
    private final OnContentRepository onContentRepository;
    private final AdEvaluationService adEvaluationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 평가 관리 메인 화면
    @RequestMapping("/main")
    public String evaluationMain(HttpServletRequest request, HttpServletResponse response, Model model)
            throws ServletException, IOException {
        return "admin/evaluation/evaluationMain";
    }

    // AI 퀴즈 출제 기준 목록
    @GetMapping("/quiz-rules")
    public String quizRuleList(Model model) {
        model.addAttribute("rules", quizGenerationRuleRepository.findAllByOrderByCategoryNameAscRuleIdAsc());
        return "admin/evaluation/quizRuleList";
    }

    // 평가 문제 목록
    @GetMapping("/questions")
    public String questionList(Model model) {
        model.addAttribute("questions", evaluationQuestionRepository.findAll());
        return "admin/evaluation/questionList";
    }

    // AI 퀴즈 자동 생성 화면
    @GetMapping("/quiz-generator")
    public String quizGeneratorForm(Model model) {
        model.addAttribute("requestDto", new AdminQuizGenerationRequestDto());
        addQuizGeneratorOptions(model);
        return "admin/evaluation/quizGeneratorForm";
    }

    // AI 퀴즈 초안 생성
    @PostMapping("/quiz-generator/preview")
    public String previewGeneratedQuiz(
            @ModelAttribute("requestDto") AdminQuizGenerationRequestDto requestDto,
            Model model,
            RedirectAttributes redirectAttributes
    ) {
        try {
            AiQuizGenerationResponseDto response = adEvaluationService.generateQuizDrafts(requestDto);
            model.addAttribute("generatedQuestions", response.getQuestions());
            model.addAttribute("generatedQuestionsJson", objectMapper.writeValueAsString(response.getQuestions()));
            model.addAttribute("selectedContent", onContentRepository.findById(requestDto.getContentId()).orElse(null));
            addQuizGeneratorOptions(model);
            return "admin/evaluation/quizGeneratorForm";
        } catch (JsonProcessingException e) {
            redirectAttributes.addFlashAttribute("errorMessage", "생성된 문제 초안을 화면에 표시하는 중 오류가 발생했습니다.");
            return "redirect:/admin/evaluation/quiz-generator";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/admin/evaluation/quiz-generator";
        }
    }

    // 생성된 퀴즈 초안 저장
    @PostMapping("/quiz-generator/save")
    public String saveGeneratedQuiz(
            @ModelAttribute AdminQuizSaveRequestDto requestDto,
            RedirectAttributes redirectAttributes
    ) {
        try {
            int savedCount = adEvaluationService.saveGeneratedQuestions(requestDto);
            redirectAttributes.addFlashAttribute("successMessage", savedCount + "개의 문제 초안을 저장했습니다.");
            return "redirect:/admin/evaluation/questions";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/admin/evaluation/quiz-generator";
        }
    }

    // AI 퀴즈 출제 기준 등록 화면
    @GetMapping("/quiz-rules/new")
    public String quizRuleForm(Model model) {
        model.addAttribute("rule", QuizGenerationRuleEntity.builder()
                .questionCount(5)
                .passScore(80)
                .difficulty(Difficulty.EASY)
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .isActive(true)
                .build());
        addQuizRuleFormOptions(model);
        model.addAttribute("isEdit", false);
        return "admin/evaluation/quizRuleForm";
    }

    // AI 퀴즈 출제 기준 등록
    @PostMapping("/quiz-rules")
    public String createQuizRule(
            @ModelAttribute AdQuizGenerationRuleRequestDto requestDto,
            RedirectAttributes redirectAttributes
    ) {
        QuizGenerationRuleEntity rule = QuizGenerationRuleEntity.builder()
                .categoryName(requestDto.getCategoryName())
                .questionCount(requestDto.getQuestionCount())
                .passScore(requestDto.getPassScore())
                .difficulty(requestDto.getDifficulty())
                .questionType(requestDto.getQuestionType())
                .isActive(Boolean.TRUE.equals(requestDto.getIsActive()))
                .build();

        quizGenerationRuleRepository.save(rule);
        redirectAttributes.addFlashAttribute("successMessage", "AI 퀴즈 출제 기준을 등록했습니다.");
        return "redirect:/admin/evaluation/quiz-rules";
    }

    // AI 퀴즈 출제 기준 수정 화면
    @GetMapping("/quiz-rules/{ruleId}/edit")
    public String editQuizRuleForm(
            @PathVariable Integer ruleId,
            Model model,
            RedirectAttributes redirectAttributes
    ) {
        return quizGenerationRuleRepository.findById(ruleId)
                .map(rule -> {
                    model.addAttribute("rule", rule);
                    addQuizRuleFormOptions(model);
                    model.addAttribute("isEdit", true);
                    return "admin/evaluation/quizRuleForm";
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("errorMessage", "AI 퀴즈 출제 기준을 찾을 수 없습니다.");
                    return "redirect:/admin/evaluation/quiz-rules";
                });
    }

    // AI 퀴즈 출제 기준 수정
    @PostMapping("/quiz-rules/{ruleId}/edit")
    public String updateQuizRule(
            @PathVariable Integer ruleId,
            @ModelAttribute AdQuizGenerationRuleRequestDto requestDto,
            RedirectAttributes redirectAttributes
    ) {
        return quizGenerationRuleRepository.findById(ruleId)
                .map(rule -> {
                    rule.updateRule(
                            requestDto.getCategoryName(),
                            requestDto.getQuestionCount(),
                            requestDto.getPassScore(),
                            requestDto.getDifficulty(),
                            requestDto.getQuestionType(),
                            requestDto.getIsActive()
                    );
                    quizGenerationRuleRepository.save(rule);
                    redirectAttributes.addFlashAttribute("successMessage", "AI 퀴즈 출제 기준을 수정했습니다.");
                    return "redirect:/admin/evaluation/quiz-rules";
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("errorMessage", "AI 퀴즈 출제 기준을 찾을 수 없습니다.");
                    return "redirect:/admin/evaluation/quiz-rules";
                });
    }

    // AI 퀴즈 출제 기준 삭제
    @PostMapping("/quiz-rules/{ruleId}/delete")
    public String deleteQuizRule(
            @PathVariable Integer ruleId,
            RedirectAttributes redirectAttributes
    ) {
        if (!quizGenerationRuleRepository.existsById(ruleId)) {
            redirectAttributes.addFlashAttribute("errorMessage", "AI 퀴즈 출제 기준을 찾을 수 없습니다.");
            return "redirect:/admin/evaluation/quiz-rules";
        }

        quizGenerationRuleRepository.deleteById(ruleId);
        redirectAttributes.addFlashAttribute("successMessage", "AI 퀴즈 출제 기준을 삭제했습니다.");
        return "redirect:/admin/evaluation/quiz-rules";
    }

    // 출제 기준 화면 공통 옵션 구성
    private void addQuizRuleFormOptions(Model model) {
        model.addAttribute("categories", getContentCategories());
        model.addAttribute("difficulties", Difficulty.values());
        model.addAttribute("questionTypes", QuestionType.values());
    }

    // 자동 생성 화면 공통 옵션 구성
    private void addQuizGeneratorOptions(Model model) {
        model.addAttribute("contents", onContentRepository.findAll());
        model.addAttribute("difficulties", Difficulty.values());
    }

    // 콘텐츠 카테고리 목록 조회
    private List<String> getContentCategories() {
        return onContentRepository.findAll().stream()
                .map(OnContentEntity::getCategory)
                .filter(category -> category != null && !category.isBlank())
                .distinct()
                .sorted()
                .toList();
    }
}
