package com.ict06.team1_fin_pj.domain.aiSecretary.service;
/* [ 보고서/회의록/결재 사유 초안 생성 흐름 담당 ] */

import com.ict06.team1_fin_pj.common.dto.aiSecretary.AssistantDraftRequestDto;
import com.ict06.team1_fin_pj.common.dto.aiSecretary.AssistantDraftResponseDto;
import com.ict06.team1_fin_pj.common.dto.aiSecretary.AssistantReviseRequestDto;
import com.ict06.team1_fin_pj.common.dto.aiSecretary.AssistantReviseResponseDto;

public interface AiAssistantDraftService {

    // 초안 생성
    AssistantDraftResponseDto createDraft(AssistantDraftRequestDto requestDto);

    // 초안 수정
    AssistantReviseResponseDto reviseDraft(AssistantReviseRequestDto requestDto);
}