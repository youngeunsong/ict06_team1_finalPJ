/**
 * @FileName : AdEvaluationService.java
 * @Description : 관리자 온보딩 평가 관리 서비스 인터페이스
 * @Author : 김다솜
 * @Date : 2026. 05. 11
 * @Modification_History
 * @
 * @ 수정일자        수정자        수정내용
 * @ ----------    ---------    -------------------------------
 * @ 2026.05.11    김다솜        AI 퀴즈 자동 생성 초안 조회 및 저장 인터페이스 추가
 */
package com.ict06.team1_fin_pj.domain.evaluation.service;

import com.ict06.team1_fin_pj.common.dto.evaluation.AdminQuizGenerationRequestDto;
import com.ict06.team1_fin_pj.common.dto.evaluation.AdminQuizSaveRequestDto;
import com.ict06.team1_fin_pj.common.dto.evaluation.AiQuizGenerationResponseDto;

public interface AdEvaluationService {

    // AI 퀴즈 초안 생성 요청
    AiQuizGenerationResponseDto generateQuizDrafts(AdminQuizGenerationRequestDto requestDto);

    // 생성된 퀴즈 초안 저장
    int saveGeneratedQuestions(AdminQuizSaveRequestDto requestDto);
}
