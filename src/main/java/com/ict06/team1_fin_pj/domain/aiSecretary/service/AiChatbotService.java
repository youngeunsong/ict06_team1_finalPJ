package com.ict06.team1_fin_pj.domain.aiSecretary.service;

/* [ 챗봇 질문 처리 흐름 담당 ]
*  프롬프트 구성/ AI Provider 호출/ AI 응답 저장/ 응답 DTO 반환
* */
import com.ict06.team1_fin_pj.common.dto.aiSecretary.ChatbotAskResponseDto;

public interface AiChatbotService {

    ChatbotAskResponseDto ask(Integer sessionId, String content);
}
