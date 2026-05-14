/**
 * @FileName : AdEvaluationService.java
 * @Description : 관리자 온보딩 평가 관리 서비스 인터페이스
 * @Author : 김다솜
 * @Date : 2026. 05. 13
 * @Modification_History
 * @
 * @ 수정일자        수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.13    김다솜        AI 퀴즈 초안 생성, 저장, 문서 연계 자동 생성 인터페이스 정리
 * @ 2026.05.14    김다솜        평가 점수 통계 및 이해도 시각화용 집계 인터페이스 추가
 */
package com.ict06.team1_fin_pj.domain.evaluation.service;

import com.ict06.team1_fin_pj.common.dto.evaluation.AdminEvaluationAnalyticsDto;
import com.ict06.team1_fin_pj.common.dto.evaluation.AdminQuizGenerationRequestDto;
import com.ict06.team1_fin_pj.common.dto.evaluation.AdminQuizSaveRequestDto;
import com.ict06.team1_fin_pj.common.dto.evaluation.AiQuizGenerationResponseDto;

public interface AdEvaluationService {

    // AI 퀴즈 초안 생성
    AiQuizGenerationResponseDto generateQuizDrafts(AdminQuizGenerationRequestDto requestDto);

    // 생성된 퀴즈 초안 저장
    int saveGeneratedQuestions(AdminQuizSaveRequestDto requestDto);

    // 문서 연계 콘텐츠 기준 문제 자동 생성 및 저장
    int generateAndSaveQuestionsForContent(Integer contentId);

    // 관리자 평가 통계 집계
    AdminEvaluationAnalyticsDto getEvaluationAnalytics();
}
