package com.ict06.team1_fin_pj.domain.aiSecretary.service;

/* [] */

import com.ict06.team1_fin_pj.domain.aiSecretary.entity.AiChatMessageEntity;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.AiChatSessionEntity;
import com.ict06.team1_fin_pj.domain.aiSecretary.entity.SessionType;

import java.util.List;

// 채팅 기능 메서드
public interface AiSecretaryService {

    // 채팅 세션 생성
    AiChatSessionEntity createSession(String empNo, SessionType sessionType, String title);

    // ASSISTANT 세션 생성
    AiChatSessionEntity createAssistantSession(String empNo, String title);

    // CHATBOT 최근 48시간 내 단일 세션 조회 또는 생성
    AiChatSessionEntity getOrCreateChatbotSession(String empNo);

    // 채팅 세션 목록 조회
    List<AiChatSessionEntity> getSessionList(String empNo, SessionType sessionType);

    // 채팅 세션 내 메시지 목록 조회
    List<AiChatMessageEntity> getMessageList(Integer sessionId);

    // 채팅 세션 내 메시지 저장
    AiChatMessageEntity saveMessage(Integer sessionId, AiChatMessageEntity message);
}